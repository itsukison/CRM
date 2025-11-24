import { useState } from 'react';
import { TableData, Row, Column, ColumnDefinition, columnToDefinition, definitionToColumn } from '@/types';
import { identifyCompanies, scrapeCompanyDetails } from '@/adapters/external/company-data.adapter';
import { EnrichmentProgress, GenerationProgress } from '@/services/enrichmentService';

interface UseTableAIProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
    selectedRowIds: Set<string>;
}

export const useTableAI = ({ table, onUpdateTable, selectedRowIds }: UseTableAIProps) => {
    const [showGenPanel, setShowGenPanel] = useState(false);
    const [genPrompt, setGenPrompt] = useState('');
    const [genCount, setGenCount] = useState(5);
    const [genSelectedColIds, setGenSelectedColIds] = useState<Set<string>>(new Set());
    const [genNewColsString, setGenNewColsString] = useState('');
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
    const [generatingRowIds, setGeneratingRowIds] = useState<Set<string>>(new Set());

    const [showEnrichPanel, setShowEnrichPanel] = useState(false);
    const [enrichTargetCols, setEnrichTargetCols] = useState<Set<string>>(new Set());
    const [enrichmentProgress, setEnrichmentProgress] = useState<Map<string, EnrichmentProgress>>(new Map());

    const handleGenerateStart = async () => {
        setShowGenPanel(false);
        setGenPrompt('');
        // 1. Ensure columns (including any new ones) are present
        let currentColumns = [...table.columns];
        const newColsCreated: Column[] = [];

        if (genNewColsString.trim()) {
            const newColNames = genNewColsString.split(/[,、]/).map(s => s.trim()).filter(s => s);
            const newColDefs: ColumnDefinition[] = [];
            newColNames.forEach((name, idx) => {
                const newCol: Column = {
                    id: `gen_col_${Date.now()}_${idx}`,
                    title: name,
                    type: 'text',
                    description: name,
                    textOverflow: 'clip'
                };
                newColsCreated.push(newCol);
                newColDefs.push(columnToDefinition(newCol, currentColumns.length + idx));
            });
            currentColumns = [...currentColumns, ...newColDefs];
            onUpdateTable(prev => ({ ...prev, columns: currentColumns }));
            newColsCreated.forEach(c => {
                setGenSelectedColIds(prev => {
                    const next = new Set(prev);
                    next.add(c.id);
                    return next;
                });
            });
        }

        const columnsToGenerate = currentColumns.filter(c =>
            genSelectedColIds.has(c.id) || newColsCreated.find(nc => nc.id === c.id)
        );

        // Convert ColumnDefinition to Column for easier handling
        const columnsForGeneration = columnsToGenerate.map(definitionToColumn);

        // Clear generation progress
        setGenerationProgress(null);
        setGeneratingRowIds(new Set());

        try {
            // 2. Identify company names (batch) – shared with WebScraper
            const query = genPrompt || '日本の実在する企業';
            setGenerationProgress({
                phase: 'generating_names',
                currentRow: 0,
                totalRows: genCount
            });

            const companyNames = await identifyCompanies(query, genCount);

            if (!companyNames || companyNames.length === 0) {
                throw new Error('企業名の生成に失敗しました');
            }

            // Determine company name column (prefer canonical id or name-like titles)
            const columnsAsLegacy = currentColumns.map(definitionToColumn);
            const companyNameColumn =
                columnsAsLegacy.find(c => c.id === 'company_name') ||
                columnsAsLegacy.find(c =>
                    c.title.includes('会社') ||
                    c.title.includes('企業') ||
                    c.title.toLowerCase().includes('company') ||
                    c.title.toLowerCase().includes('name')
                ) ||
                columnsAsLegacy[0];

            if (!companyNameColumn) {
                throw new Error('会社名カラムが見つかりません');
            }

            // 3. Reuse existing empty rows where possible and place new records
            //    directly below the last non-empty row.
            const baseRows: Row[] = [];

            onUpdateTable(prev => {
                const rowsCopy = [...prev.rows];

                // Helper to determine if a row has any meaningful data
                const rowHasData = (row: Row) =>
                    currentColumns.some(col => {
                        const v = row[col.id];
                        return v !== undefined && v !== null && String(v).trim() !== '';
                    });

                // Find last row index that has any data
                let lastFilledIndex = -1;
                for (let i = 0; i < rowsCopy.length; i++) {
                    if (rowHasData(rowsCopy[i])) {
                        lastFilledIndex = i;
                    }
                }

                const effectiveNames = companyNames.slice(0, genCount);
                const insertStart = lastFilledIndex + 1;

                effectiveNames.forEach((name, idx) => {
                    const targetIndex = insertStart + idx;
                    let row: Row;

                    if (targetIndex < rowsCopy.length) {
                        // Reuse existing placeholder/empty row
                        row = { ...rowsCopy[targetIndex] };
                    } else {
                        // Not enough existing rows – append a new one
                        row = { id: `gen_${Date.now()}_${idx}` };
                        currentColumns.forEach(col => {
                            row[col.id] = '';
                        });
                    }

                    row[companyNameColumn.id] = name;
                    rowsCopy[targetIndex] = row;
                    baseRows.push(row);
                });

                return { ...prev, rows: rowsCopy };
            });

            const generatedRowIds = new Set<string>();

            // 4. Enrich each row sequentially (one API call per row)
            setGenerationProgress({
                phase: 'enriching_details',
                currentRow: 0,
                totalRows: baseRows.length
            });

            for (let i = 0; i < baseRows.length; i++) {
                const row = baseRows[i];
                const companyName = row[companyNameColumn.id] as string;

                setGenerationProgress({
                    phase: 'enriching_details',
                    currentRow: i + 1,
                    totalRows: baseRows.length,
                    currentColumn: companyNameColumn.title,
                    rowId: row.id
                });

                setGeneratingRowIds(prev => {
                    const next = new Set(prev);
                    next.add(row.id);
                    return next;
                });

                const targetColumnTitles = columnsForGeneration.map(c => c.title);

                try {
                    const { data } = await scrapeCompanyDetails(companyName, targetColumnTitles);

                    const updatedRow: Row = { ...row };
                    columnsForGeneration.forEach(col => {
                        const value = data[col.title];
                        if (value !== undefined) {
                            updatedRow[col.id] = value;
                        }
                    });

                    generatedRowIds.add(updatedRow.id);

                    onUpdateTable(prev => {
                        const existingIdx = prev.rows.findIndex(r => r.id === updatedRow.id);
                        const newRows = [...prev.rows];
                        if (existingIdx !== -1) {
                            newRows[existingIdx] = updatedRow;
                        } else {
                            newRows.push(updatedRow);
                        }
                        return { ...prev, rows: newRows };
                    });
                } catch (e) {
                    console.error(`Failed to enrich row for ${companyName}`, e);
                } finally {
                    setGeneratingRowIds(prev => {
                        const next = new Set(prev);
                        next.delete(row.id);
                        return next;
                    });
                }
            }

            setGenerationProgress({
                phase: 'complete',
                currentRow: baseRows.length,
                totalRows: baseRows.length
            });
        } catch (e) {
            console.error(e);
            alert("生成に失敗しました");
        } finally {
            setGeneratingRowIds(new Set());
            setGenerationProgress(null);
            setGenNewColsString('');
        }
    };

    const handleEnrichmentStart = async () => {
        if (selectedRowIds.size === 0 || enrichTargetCols.size === 0) return;
        setShowEnrichPanel(false);

        const targetColIds = Array.from(enrichTargetCols);
        const targetColDefs = table.columns.filter(c => targetColIds.includes(c.id));
        const targetCols = targetColDefs.map(definitionToColumn);
        const allColumns = table.columns.map(definitionToColumn);

        // Prefer canonical company name column, then name/domain-like columns
        const companyKeyColumn =
            allColumns.find(c => c.id === 'company_name') ||
            allColumns.find(c => {
                const title = c.title.toLowerCase();
                return (
                    title.includes('会社') ||
                    title.includes('企業') ||
                    title.includes('社名') ||
                    title.includes('company') ||
                    title.includes('name') ||
                    title.includes('domain') ||
                    title.includes('ドメイン') ||
                    title.includes('website') ||
                    title.includes('サイト') ||
                    title.includes('url')
                );
            }) ||
            null;

        if (!companyKeyColumn) {
            alert('会社名またはドメインを表すカラムが見つかりません。');
            return;
        }

        setEnrichmentProgress(new Map());

        const rowsToEnrich = table.rows.filter(r => selectedRowIds.has(r.id));

        for (const row of rowsToEnrich) {
            const companyKey = row[companyKeyColumn.id] as string;

            if (!companyKey || typeof companyKey !== 'string' || companyKey.trim() === '') {
                // Mark error for all target cells in this row
                setEnrichmentProgress(prev => {
                    const next = new Map(prev);
                    targetCols.forEach(col => {
                        const cellKey = `${row.id}-${col.id}`;
                        next.set(cellKey, {
                            rowId: row.id,
                            columnId: col.id,
                            phase: 'error',
                            error: 'キーとなる会社名/ドメインが空です'
                        });
                    });
                    return next;
                });
                continue;
            }

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
                const columnTitles = targetCols.map(col => col.title);
                const { data } = await scrapeCompanyDetails(companyKey, columnTitles);

                // Update row in table
                onUpdateTable(prevTable => {
                    const newRows = prevTable.rows.map(r => {
                        if (r.id !== row.id) return r;
                        const updated: Row = { ...r };
                        targetCols.forEach(col => {
                            const value = data[col.title];
                            if (value !== undefined) {
                                updated[col.id] = value;
                            }
                        });
                        return updated;
                    });
                    return { ...prevTable, rows: newRows };
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
                            result: value !== undefined ? {
                                field: col.title,
                                value,
                                confidence: 'high'
                            } : undefined
                        });
                    });
                    return next;
                });
            } catch (e) {
                console.error(`Failed to enrich row ${row.id}`, e);
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
            }
        }

        setTimeout(() => {
            setEnrichmentProgress(new Map());
        }, 3000);

        setEnrichTargetCols(new Set());
    };

    return {
        showGenPanel,
        setShowGenPanel,
        genPrompt,
        setGenPrompt,
        genCount,
        setGenCount,
        genSelectedColIds,
        setGenSelectedColIds,
        genNewColsString,
        setGenNewColsString,
        generationProgress,
        generatingRowIds,
        showEnrichPanel,
        setShowEnrichPanel,
        enrichTargetCols,
        setEnrichTargetCols,
        enrichmentProgress,
        handleGenerateStart,
        handleEnrichmentStart
    };
};
