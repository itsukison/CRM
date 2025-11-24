'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TableView } from '@/components/TableView';
import { ChatWidget } from '@/components/ChatWidget';
import { TableData, Filter, SortState, Row } from '@/types';
import { getTable, updateTable } from '@/services/tableService';
import { createRow, updateRow, deleteRow, rowToData } from '@/services/rowService';

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
            } catch (err) {
                console.error('Error loading table:', err);
                setError('テーブルの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        }
        loadTable();
    }, [tableId]);

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

    const syncChanges = async (oldTable: TableData, newTable: TableData) => {
        // 1. Check for Column Changes
        const oldColsJson = JSON.stringify(oldTable.columns);
        const newColsJson = JSON.stringify(newTable.columns);

        if (oldColsJson !== newColsJson) {
            console.log('Syncing column changes...');
            try {
                await updateTable(newTable.id, { columns: newTable.columns });
                // Update ref
                if (prevTableRef.current) {
                    prevTableRef.current.columns = newTable.columns;
                }
            } catch (e) {
                console.error('Failed to sync columns:', e);
                // TODO: Revert UI?
            }
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
                if (!r.id.startsWith('empty_') && !r.id.startsWith('gen_temp_')) {
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
                if (newRow.id.startsWith('empty_') || newRow.id.startsWith('gen_temp_')) {
                    // Only create if it has some data
                    const hasData = newTable.columns.some(col => {
                        const val = newRow[col.id];
                        return val !== undefined && val !== null && val !== '';
                    });

                    if (hasData) {
                        console.log('Creating new row from placeholder:', newRow.id);
                        try {
                            const { row: createdRow, error } = await createRow(newTable.id, rowToData(newRow));
                            if (error || !createdRow) throw error;

                            // Update local state to replace temp ID with real ID
                            setTable(current => {
                                if (!current) return null;
                                return {
                                    ...current,
                                    rows: current.rows.map(r => r.id === newRow.id ? createdRow : r)
                                };
                            });
                        } catch (e) {
                            console.error('Failed to create row:', e);
                        }
                    }
                } else {
                    // It's a new row with a real ID (unlikely in this flow unless generated elsewhere)
                    // Treat as create just in case
                    // But usually new rows start with temp IDs.
                }
            } else {
                // EXISTING ROW
                // Check if content changed
                // We only check columns defined in the table
                const hasChanged = newTable.columns.some(col => newRow[col.id] !== oldRow[col.id]);

                if (hasChanged) {
                    // Skip updates for placeholder rows that haven't been created yet
                    if (newRow.id.startsWith('empty_') || newRow.id.startsWith('gen_temp_')) {
                        // If it has data now, it should have been caught in the "New Row" block?
                        // No, because it exists in oldTable (added by TableView useEffect).
                        // So if an empty row is edited, it falls here.

                        // Logic: If it's a temp row, and has data, create it.
                        const hasData = newTable.columns.some(col => {
                            const val = newRow[col.id];
                            return val !== undefined && val !== null && val !== '';
                        });

                        if (hasData) {
                            console.log('Creating row from edited placeholder:', newRow.id);
                            try {
                                const { row: createdRow, error } = await createRow(newTable.id, rowToData(newRow));
                                if (error || !createdRow) throw error;

                                // Replace ID
                                setTable(current => {
                                    if (!current) return null;
                                    return {
                                        ...current,
                                        rows: current.rows.map(r => r.id === newRow.id ? createdRow : r)
                                    };
                                });
                            } catch (e) {
                                console.error('Failed to create row:', e);
                            }
                        }
                    } else {
                        // Real row update
                        console.log('Updating row:', newRow.id);
                        try {
                            await updateRow(newRow.id, rowToData(newRow));
                        } catch (e) {
                            console.error('Failed to update row:', e);
                        }
                    }
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
