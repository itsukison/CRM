'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TableView } from '@/components/TableView';
import { ChatWidget } from '@/components/ChatWidget';
import { TableData, Filter, SortState, Row, definitionToColumn } from '@/types';
import { getTable, updateTable } from '@/services/tableService';
import { createRow, updateRow, deleteRow, rowToData } from '@/services/rowService';
import { identifyCompanies, scrapeCompanyDetails } from '@/services/companyService';
import { findCompanyKeyColumn } from '@/components/tableAiTools';
import { EnrichmentProgress } from '@/services/enrichmentService';
import { toast } from 'sonner';

interface TablePageProps {
    tableId: string;
}

const TablePage: React.FC<TablePageProps> = ({ tableId }) => {
    const router = useRouter();
    const [table, setTable] = useState<TableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
    const [activeSorts, setActiveSorts] = useState<SortState[]>([]);
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
    const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(new Set());
    const [enrichmentProgress, setEnrichmentProgress] = useState<Map<string, EnrichmentProgress>>(new Map());
    const [generatingRowIds, setGeneratingRowIds] = useState<Set<string>>(new Set());

    // Refs to track previous state for diffing
    const prevTableRef = useRef<TableData | null>(null);

    // Fetch table data
    useEffect(() => {
        async function loadTable() {
            try {
                setLoading(true);
                const { table: loadedTable, error } = await getTable(tableId);
                if (error) throw error;
                if (!loadedTable) throw new Error('Table not found');

                setTable(loadedTable);
                prevTableRef.current = JSON.parse(JSON.stringify(loadedTable));

                // Check for pending generation
                checkPendingGeneration(loadedTable);
            } catch (err) {
                console.error('Error loading table:', err);
                setError('テーブルの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        }
        loadTable();
    }, [tableId]);

    const checkPendingGeneration = async (currentTable: TableData) => {
        const pendingGen = sessionStorage.getItem(`pending_generation_${tableId}`);
        if (pendingGen) {
            try {
                const params = JSON.parse(pendingGen);
                sessionStorage.removeItem(`pending_generation_${tableId}`);

                toast.info('AI生成を開始しました', { description: 'バックグラウンドで企業リストを作成しています...' });
                await startRealtimeGeneration(currentTable, params);
            } catch (e) {
                console.error('Failed to parse pending generation params:', e);
            }
        }
    };

    const startRealtimeGeneration = async (currentTable: TableData, params: { prompt: string; count: number; companyContext: string }) => {
        const { prompt, count, companyContext } = params;

        // Clear previous progress
        setEnrichmentProgress(new Map());
        setGeneratingRowIds(new Set());

        // 1. Identify Companies (batch generation first)
        let query = prompt;
        if (companyContext) {
            query += `\n\n【ユーザーの会社情報（この会社にとっての理想的な顧客を探してください）】\n${companyContext}`;
        }

        try {
            toast.info('企業名を生成中...', { description: '企業リストを作成しています...' });
            const companyNames = await identifyCompanies(query, count);
            if (!companyNames || companyNames.length === 0) {
                toast.error('企業の特定に失敗しました');
                return;
            }

            const companyKeyColumn = findCompanyKeyColumn(currentTable.columns);
            if (!companyKeyColumn) {
                toast.error('会社名カラムが見つかりません');
                return;
            }

            // 2. Create rows with company names only (no enrichment yet)
            const createdRows: Row[] = [];
            for (const name of companyNames) {
                const newRowData: Record<string, any> = {};
                currentTable.columns.forEach(col => newRowData[col.id] = '');
                newRowData[companyKeyColumn.id] = name;

                // Set default status if status column exists
                const statusCol = currentTable.columns.find(c => c.id === 'col_status' || c.name === 'ステータス');
                if (statusCol) {
                    newRowData[statusCol.id] = '未連絡';
                }

                const { row: createdRow, error } = await createRow(currentTable.id, newRowData);
                if (error || !createdRow) {
                    console.error(`Failed to create row for ${name}:`, error);
                    continue;
                }

                createdRows.push(createdRow);

                // Update local state immediately
                setTable(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        rows: [...prev.rows, createdRow]
                    };
                });
            }

            // 3. Enrich each row sequentially with Google search grounding
            const targetCols = currentTable.columns.map(definitionToColumn).filter(c =>
                c.id !== companyKeyColumn.id &&
                c.id !== 'col_status' &&
                c.title !== 'ステータス'
            );
            const targetTitles = targetCols.map(c => c.title);

            for (let i = 0; i < createdRows.length; i++) {
                const row = createdRows[i];
                const companyName = row[companyKeyColumn.id] as string;

                if (!companyName) continue;

                // Mark row as generating
                setGeneratingRowIds(prev => {
                    const next = new Set(prev);
                    next.add(row.id);
                    return next;
                });

                // Set progress to "discovery" for all target cells
                setEnrichmentProgress(prev => {
                    const next = new Map(prev);
                    targetCols.forEach(col => {
                        const cellKey = `${row.id}-${col.id}`;
                        next.set(cellKey, {
                            rowId: row.id,
                            columnId: col.id,
                            phase: 'discovery'
                        });
                    });
                    return next;
                });

                try {
                    const { data } = await scrapeCompanyDetails(companyName, targetTitles, companyContext);

                    // Merge enriched data (excluding status column)
                    const enrichedData = { ...row };
                    targetCols.forEach(col => {
                        const value = data[col.title];
                        // Set value if it exists, including 'N/A' to ensure empty cells are filled
                        if (value !== undefined) {
                            enrichedData[col.id] = value;
                        }
                    });

                    // Update row in database
                    await updateRow(row.id, rowToData(enrichedData, currentTable.columns));

                    // Update local state with enriched data
                    setTable(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            rows: prev.rows.map(r => r.id === row.id ? enrichedData : r)
                        };
                    });

                    // Mark complete for all target cells
                    setEnrichmentProgress(prev => {
                        const next = new Map(prev);
                        targetCols.forEach(col => {
                            const cellKey = `${row.id}-${col.id}`;
                            const value = data[col.title];
                            next.set(cellKey, {
                                rowId: row.id,
                                columnId: col.id,
                                phase: 'complete',
                                result: value !== undefined && value !== 'N/A' ? {
                                    field: col.title,
                                    value,
                                    confidence: 'high' as const
                                } : undefined
                            });
                        });
                        return next;
                    });
                } catch (e) {
                    console.error(`Failed to enrich row for ${companyName}:`, e);
                    // Mark error for all target cells
                    setEnrichmentProgress(prev => {
                        const next = new Map(prev);
                        targetCols.forEach(col => {
                            const cellKey = `${row.id}-${col.id}`;
                            next.set(cellKey, {
                                rowId: row.id,
                                columnId: col.id,
                                phase: 'error',
                                error: e instanceof Error ? e.message : '不明なエラー'
                            });
                        });
                        return next;
                    });
                } finally {
                    // Remove from generating set
                    setGeneratingRowIds(prev => {
                        const next = new Set(prev);
                        next.delete(row.id);
                        return next;
                    });
                }
            }

            // Clear progress after a delay
            setTimeout(() => {
                setEnrichmentProgress(new Map());
            }, 3000);

            toast.success('生成が完了しました');
        } catch (e) {
            console.error('Generation failed:', e);
            toast.error('生成中にエラーが発生しました');
            setEnrichmentProgress(new Map());
            setGeneratingRowIds(new Set());
        }
    };


    const handleUpdateTable = async (updatedTableOrFn: TableData | ((prev: TableData) => TableData)) => {
        setTable(prev => {
            if (!prev) return null;
            const newTable = typeof updatedTableOrFn === 'function'
                ? updatedTableOrFn(prev)
                : updatedTableOrFn;

            // Perform async sync operation
            syncChanges(prev, newTable);

            return newTable;
        });
    };

    // Helper function to normalize cell values for comparison
    // Treats undefined, null, and empty string as equivalent (all mean "empty")
    const normalizeCellValue = (value: any): any => {
        if (value === undefined || value === null || value === '') {
            return null; // Normalize all "empty" values to null for comparison
        }
        return value;
    };

    // Helper function to check if two cell values are different
    const cellValueChanged = (oldValue: any, newValue: any): boolean => {
        // Special case: if oldValue is undefined (column doesn't exist in row's JSONB),
        // and newValue is defined (even if empty string), this is a change.
        // This handles the case where a user edits an empty cell in a column that wasn't
        // previously stored in the database.
        if (oldValue === undefined && newValue !== undefined) {
            return true;
        }

        const normalizedOld = normalizeCellValue(oldValue);
        const normalizedNew = normalizeCellValue(newValue);

        // If both are normalized to null, no change
        if (normalizedOld === null && normalizedNew === null) {
            return false;
        }

        // Otherwise, compare the normalized values
        return normalizedOld !== normalizedNew;
    };

    const syncChanges = async (oldTable: TableData, newTable: TableData) => {
        // 1. Check for Column Changes
        const oldColsJson = JSON.stringify(oldTable.columns);
        const newColsJson = JSON.stringify(newTable.columns);

        if (oldColsJson !== newColsJson) {
            console.log('Syncing column changes...');
            console.log('Old Columns:', oldTable.columns);
            console.log('New Columns:', newTable.columns);
            try {
                const { error } = await updateTable(newTable.id, { columns: newTable.columns });
                if (error) {
                    console.error('Supabase updateTable error:', error);
                    throw error;
                }
                console.log('Column sync successful');
                // Update ref
                if (prevTableRef.current) {
                    prevTableRef.current.columns = newTable.columns;
                }
            } catch (e) {
                console.error('Failed to sync columns:', e);
                // TODO: Revert UI?
            }
        } else {
            console.log('No column changes detected');
        }

        // 2. Check for Row Changes
        // This logic needs to be robust.
        // We iterate through new rows to find Creates and Updates
        // We iterate through old rows to find Deletes

        const oldRowsMap = new Map(oldTable.rows.map(r => [r.id, r]));
        const newRowsMap = new Map(newTable.rows.map(r => [r.id, r]));

        // Check Deletions
        const deletedRowIds: string[] = [];
        oldTable.rows.forEach(r => {
            if (!newRowsMap.has(r.id)) {
                // If it was a real row (not empty placeholder), delete it
                // Check for all placeholder prefixes: empty_, gen_temp_, placeholder_row_
                if (!r.id.startsWith('empty_') &&
                    !r.id.startsWith('gen_temp_') &&
                    !r.id.startsWith('placeholder_row_') &&
                    !(r as any).isPlaceholder) {
                    deletedRowIds.push(r.id);
                }
            }
        });

        if (deletedRowIds.length > 0) {
            console.log('Syncing deletions:', deletedRowIds);
            try {
                await Promise.all(deletedRowIds.map(id => deleteRow(id)));
            } catch (e) {
                console.error('Failed to delete rows:', e);
            }
        }

        // Check Updates and Creates
        for (const newRow of newTable.rows) {
            const oldRow = oldRowsMap.get(newRow.id);

            if (!oldRow) {
                // NEW ROW
                // Check if it is an "empty" placeholder row
                // Check for all placeholder prefixes: empty_, gen_temp_, placeholder_row_
                const isPlaceholderRow = newRow.id.startsWith('empty_') ||
                    newRow.id.startsWith('gen_temp_') ||
                    newRow.id.startsWith('placeholder_row_') ||
                    (newRow as any).isPlaceholder;

                if (isPlaceholderRow) {
                    // Only create if it has some real data (not just placeholders)
                    const hasData = newTable.columns.some(col => {
                        const val = newRow[col.id];
                        // Exclude undefined, null, empty string (placeholder values)
                        if (val === undefined || val === null || val === '') return false;
                        return true;
                    });

                    if (hasData) {
                        console.log('Creating new row from placeholder:', newRow.id);
                        try {
                            const { row: createdRow, error } = await createRow(newTable.id, rowToData(newRow, newTable.columns));
                            if (error || !createdRow) {
                                console.error('Failed to create row:', error);
                                throw error;
                            }

                            // Update local state to replace temp ID with real ID
                            setTable(current => {
                                if (!current) return null;
                                return {
                                    ...current,
                                    rows: current.rows.map(r => r.id === newRow.id ? createdRow : r)
                                };
                            });
                            console.log('Successfully created row:', createdRow.id, 'replacing placeholder:', newRow.id);
                        } catch (e) {
                            console.error('Failed to create row:', e);
                            toast.error('行の作成に失敗しました');
                        }
                    }
                } else {
                    // It's a new row with a real ID (unlikely in this flow unless generated elsewhere)
                    // Treat as create just in case
                    // But usually new rows start with temp IDs.
                }
            } else {
                // EXISTING ROW
                // Check if content changed using normalized comparison
                // We only check columns defined in the table
                const changedColumns: string[] = [];
                newTable.columns.forEach(col => {
                    const oldValue = oldRow[col.id];
                    const newValue = newRow[col.id];
                    if (cellValueChanged(oldValue, newValue)) {
                        changedColumns.push(col.id);
                    }
                });
                const hasChanged = changedColumns.length > 0;

                if (hasChanged) {
                    console.log(`Row ${newRow.id} changed. Columns:`, changedColumns);
                    console.log('Old values:', changedColumns.map(colId => ({ [colId]: oldRow[colId] })));
                    console.log('New values:', changedColumns.map(colId => ({ [colId]: newRow[colId] })));

                    // Skip updates for placeholder rows that haven't been created yet
                    // Check for all placeholder prefixes: empty_, gen_temp_, placeholder_row_
                    const isPlaceholderRow = newRow.id.startsWith('empty_') ||
                        newRow.id.startsWith('gen_temp_') ||
                        newRow.id.startsWith('placeholder_row_') ||
                        (newRow as any).isPlaceholder;

                    if (isPlaceholderRow) {
                        // If it has data now, it should have been caught in the "New Row" block?
                        // No, because it exists in oldTable (added by TableView useEffect).
                        // So if an empty row is edited, it falls here.

                        // Logic: If it's a temp row, and has real data (not just placeholders), create it.
                        const hasData = newTable.columns.some(col => {
                            const val = newRow[col.id];
                            // Exclude undefined, null, empty string (placeholder values)
                            if (val === undefined || val === null || val === '') return false;
                            return true;
                        });

                        if (hasData) {
                            console.log('Creating row from edited placeholder:', newRow.id);
                            try {
                                const { row: createdRow, error } = await createRow(newTable.id, rowToData(newRow, newTable.columns));
                                if (error || !createdRow) {
                                    console.error('Failed to create row from placeholder:', error);
                                    throw error;
                                }

                                // Replace ID
                                setTable(current => {
                                    if (!current) return null;
                                    return {
                                        ...current,
                                        rows: current.rows.map(r => r.id === newRow.id ? createdRow : r)
                                    };
                                });
                                console.log('Successfully created row from placeholder:', createdRow.id, 'replacing:', newRow.id);
                            } catch (e) {
                                console.error('Failed to create row from placeholder:', e);
                                toast.error('行の作成に失敗しました');
                            }
                        } else {
                            console.log('Placeholder row has no data, skipping create:', newRow.id);
                        }
                    } else {
                        // Real row update - this is a row that exists in the database
                        console.log('Updating existing row:', newRow.id);
                        try {
                            const updateData = rowToData(newRow, newTable.columns);
                            console.log('Update data for row', newRow.id, ':', updateData);
                            console.log('Changed columns:', changedColumns);

                            const { error } = await updateRow(newRow.id, updateData);
                            if (error) {
                                console.error('Update row error for', newRow.id, ':', error);
                                throw error;
                            }
                            console.log('Row updated successfully:', newRow.id);
                        } catch (e) {
                            console.error('Failed to update row:', newRow.id, e);
                            toast.error('行の更新に失敗しました');
                        }
                    }
                } else {
                    console.log(`Row ${newRow.id} - no changes detected`);
                }
            }
        }
    };

    const filteredTable = useMemo(() => {
        if (!table) return null;

        let processedRows = [...table.rows];

        // Multi-Filter Logic (AND)
        if (activeFilters.length > 0) {
            processedRows = processedRows.filter(row => {
                return activeFilters.every(filter => {
                    const val = row[filter.columnId];
                    const strVal = String(val ?? '').toLowerCase();
                    const filterVal = filter.value.toLowerCase();

                    switch (filter.operator) {
                        case 'contains': return strVal.includes(filterVal);
                        case 'equals': return strVal === filterVal;
                        case 'greater':
                            const numValG = parseFloat(strVal);
                            const numFilterG = parseFloat(filterVal);
                            return !isNaN(numValG) && !isNaN(numFilterG) && numValG > numFilterG;
                        case 'less':
                            const numValL = parseFloat(strVal);
                            const numFilterL = parseFloat(filterVal);
                            return !isNaN(numValL) && !isNaN(numFilterL) && numValL < numFilterL;
                        default: return true;
                    }
                });
            });
        }

        // Multi-Sort Logic
        if (activeSorts.length > 0) {
            processedRows.sort((a, b) => {
                for (const sort of activeSorts) {
                    const valA = a[sort.columnId];
                    const valB = b[sort.columnId];

                    if (valA === valB) continue;
                    if (valA === undefined || valA === null || valA === '') return 1;
                    if (valB === undefined || valB === null || valB === '') return -1;

                    let comparison = 0;
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        comparison = valA - valB;
                    } else {
                        const strA = String(valA).toLowerCase();
                        const strB = String(valB).toLowerCase();
                        if (strA < strB) comparison = -1;
                        if (strA > strB) comparison = 1;
                    }

                    return sort.direction === 'asc' ? comparison : -comparison;
                }
                return 0;
            });
        }

        return { ...table, rows: processedRows };
    }, [table, activeFilters, activeSorts]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !table || !filteredTable) {
        return (
            <div style={{ padding: '2rem', fontFamily: 'JetBrains Mono, monospace' }}>
                <p>{error || 'Table not found'}</p>
                <button onClick={() => router.push('/dashboard')} className="text-blue-600 underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <>
            <TableView
                table={filteredTable}
                onUpdateTable={handleUpdateTable}
                activeSorts={activeSorts}
                onUpdateSorts={setActiveSorts}
                activeFilters={activeFilters}
                onUpdateFilters={setActiveFilters}
                selectedRowIds={selectedRowIds}
                onSelectRowIds={setSelectedRowIds}
                selectedCellIds={selectedCellIds}
                onSelectCellIds={setSelectedCellIds}
                enrichmentProgress={enrichmentProgress}
                generatingRowIds={generatingRowIds}
            />
            <ChatWidget
                table={table}
                onApplyFilter={(f) => setActiveFilters(f ? [f] : [])}
                onApplySort={(s) => setActiveSorts(s ? [s] : [])}
                onUpdateTable={handleUpdateTable}
                selectedRowIds={selectedRowIds}
                selectedCellIds={selectedCellIds}
            />
        </>
    );
};

export default TablePage;
