
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TableData, Row, Column, ColumnDefinition, ColumnType, SortState, Filter, TextOverflowMode, definitionToColumn, columnToDefinition } from '../types';
import { identifyCompanies, scrapeCompanyDetails } from '../services/companyService';
import type { EnrichmentProgress, GenerationProgress } from '../services/enrichmentService';
import {
    IconSparkles, IconPlus, IconTrash, IconCheck, IconBolt, IconX, IconDatabase, IconSettings,
    IconFilter, IconSort, IconChevronRight, IconWrapText, IconClip, IconOverflowVisible,
    IconFileText, IconAlertTriangle, IconInfo, IconSearch
} from './Icons';

// ... (rest of imports)

// ... (inside component)

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// --- Formula Evaluation Logic ---
const evaluateFormula = (expression: string, row: Row, columns: Column[]) => {
    try {
        // Remove the leading '='
        const cleanExpr = expression.substring(1);

        // Replace [Column Name] references with values
        // Regex looks for square brackets: [Price]
        const parsedExpr = cleanExpr.replace(/\[([^\]]+)\]/g, (match, colTitle) => {
            const col = columns.find(c => c.title === colTitle);
            if (!col) return '0';
            const val = row[col.id];
            // If value is empty or null, treat as 0 for math, or empty string for text
            if (val === undefined || val === null || val === '') return '0';
            // If it's a number, return it. If string, quote it.
            return isNaN(Number(val)) ? `"${val}"` : val;
        });

        // Safety check: only allow basic math and comparisons
        // This is a basic implementation. In production, use a safe math parser library.
        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${parsedExpr})`)();
        return result;
    } catch (e) {
        return '#ERROR';
    }
};

// Helper for column letters
const getColumnLetter = (colIndex: number) => {
    let letter = '';
    while (colIndex >= 0) {
        letter = String.fromCharCode((colIndex % 26) + 65) + letter;
        colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
};


// --- reusable components ---
const CustomSelect = ({
    value,
    onChange,
    options,
    className = ""
}: {
    value: string,
    onChange: (val: string) => void,
    options: { value: string, label: string }[],
    className?: string
}) => {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={`w-full h-9 bg-white ${className}`}>
                <SelectValue placeholder={options.find(o => o.value === value)?.label} />
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};


interface TableViewProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
    activeSorts: SortState[];
    onUpdateSorts: (sorts: SortState[]) => void;
    activeFilters: Filter[];
    onUpdateFilters: (filters: Filter[]) => void;
    selectedRowIds: Set<string>;
    onSelectRowIds: (ids: Set<string>) => void;
    selectedCellIds: Set<string>;
    onSelectCellIds: (ids: Set<string>) => void;
}

export const TableView: React.FC<TableViewProps> = ({
    table,
    onUpdateTable,
    activeSorts,
    onUpdateSorts,
    activeFilters,
    onUpdateFilters,
    selectedRowIds,
    onSelectRowIds,
    selectedCellIds,
    onSelectCellIds
}) => {
    const [anchorCell, setAnchorCell] = useState<{ rowId: string, colId: string } | null>(null);
    const [editingCell, setEditingCell] = useState<{ rowId: string, colId: string } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
    });

    // Column Resizing
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizingRef = useRef<{ colId: string, startX: number, startWidth: number } | null>(null);

    // Modals & Menus State
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showGenPanel, setShowGenPanel] = useState(false);
    const [showEnrichPanel, setShowEnrichPanel] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Column Management State
    const [activeColMenu, setActiveColMenu] = useState<string | null>(null); // colId
    const [editingCol, setEditingCol] = useState<Column | null>(null);

    // Loading States
    const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set());
    const [generatingRowIds, setGeneratingRowIds] = useState<Set<string>>(new Set());

    // Enrichment Progress State (NEW)
    const [enrichmentProgress, setEnrichmentProgress] = useState<Map<string, EnrichmentProgress>>(new Map());

    // Generation Inputs
    const [genPrompt, setGenPrompt] = useState('');
    const [genCount, setGenCount] = useState(3);
    const [genSelectedColIds, setGenSelectedColIds] = useState<Set<string>>(new Set());
    const [genNewColsString, setGenNewColsString] = useState('');

    // Enrichment Inputs
    const [enrichTargetCols, setEnrichTargetCols] = useState<Set<string>>(new Set());

    // Generation Progress State (NEW)
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);

    // New Filter/Sort Inputs (for adding NEW rules)
    const [newFilter, setNewFilter] = useState<Filter>({ columnId: '', operator: 'contains', value: '' });
    const [newSort, setNewSort] = useState<SortState>({ columnId: '', direction: 'asc' });

    // Refs for click outside and container focus
    const containerRef = useRef<HTMLDivElement>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const genPanelRef = useRef<HTMLDivElement>(null);
    const enrichPanelRef = useRef<HTMLDivElement>(null);
    const colMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) setShowAddMenu(false);
            if (colMenuRef.current && !colMenuRef.current.contains(event.target as Node)) setActiveColMenu(null);
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) setShowFilterMenu(false);
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) setShowSortMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize inputs when menu opens
    useEffect(() => {
        if (showFilterMenu && table.columns.length > 0 && !newFilter.columnId) {
            setNewFilter(prev => ({ ...prev, columnId: table.columns[0].id }));
        }
        if (showSortMenu && table.columns.length > 0 && !newSort.columnId) {
            setNewSort(prev => ({ ...prev, columnId: table.columns[0].id }));
        }
    }, [showFilterMenu, showSortMenu, table.columns]);

    // Helper to check for placeholder columns
    const isPlaceholderColumn = useCallback((col: Column) => {
        const title = (col.title || '').trim();
        const isAutoColumnNumber = /^Column \d+$/i.test(title);
        const isAutoColumnLetter = /^Column [A-Z]+$/i.test(title);
        const hasNoDescription = !col.description || col.description.trim() === '';

        // Treat unnamed or auto-generated "Column X" / "Column A" style headers as placeholders
        if (!title) return true;
        if ((isAutoColumnNumber || isAutoColumnLetter) && hasNoDescription) return true;

        return false;
    }, []);

    useEffect(() => {
        if (showGenPanel) {
            // Only select columns that are NOT empty placeholders by default
            const columnsAsLegacy = table.columns.map(definitionToColumn);
            setGenSelectedColIds(new Set(columnsAsLegacy
                .filter(c => !isPlaceholderColumn(c))
                .map(c => c.id)
            ));
        }
    }, [showGenPanel, table.columns, isPlaceholderColumn]);

    // Ensure we have enough empty rows for spreadsheet feel
    useEffect(() => {
        const MIN_ROWS = 50;
        const MIN_COLUMNS = 10;

        let needsUpdate = false;
        let updatedTable = { ...table };

        // Check and add minimum rows
        if (table.rows.length < MIN_ROWS) {
            const needed = MIN_ROWS - table.rows.length;
            const newRows: Row[] = [];
            for (let i = 0; i < needed; i++) {
                const r: Row = { id: `empty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}` };
                table.columns.forEach(c => r[c.id] = '');
                newRows.push(r);
            }
            updatedTable.rows = [...table.rows, ...newRows];
            needsUpdate = true;
        }

        // Check and add minimum columns (A~J = 10 columns)
        if (table.columns.length < MIN_COLUMNS) {
            const needed = MIN_COLUMNS - table.columns.length;
            const newColumns: ColumnDefinition[] = [];

            for (let i = 0; i < needed; i++) {
                const colIndex = table.columns.length + i;
                const colLetter = getColumnLetter(colIndex);
                const newColId = `col_placeholder_${Date.now()}_${i}`;

                newColumns.push({
                    id: newColId,
                    name: `Column ${colLetter}`,
                    type: 'text',
                    description: '',
                    required: false,
                    order: colIndex,
                    textOverflow: 'clip' // Set default to clip
                });
            }

            updatedTable.columns = [...table.columns, ...newColumns];

            // Add empty values for new columns to all existing rows
            updatedTable.rows = updatedTable.rows.map(row => {
                const newRow = { ...row };
                newColumns.forEach(col => {
                    newRow[col.id] = '';
                });
                return newRow;
            });

            needsUpdate = true;
        }

        if (needsUpdate) {
            setTimeout(() => {
                onUpdateTable(updatedTable);
            }, 0);
        }
    }, [table.rows.length, table.columns.length]);

    // --- Column Resize Logic ---
    const handleColResizeMove = useCallback((e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { colId, startX, startWidth } = resizingRef.current;
        const diff = e.pageX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Min width 50
        setColumnWidths(prev => ({ ...prev, [colId]: newWidth }));
    }, []);

    const handleColResizeEnd = useCallback(() => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleColResizeMove);
        document.removeEventListener('mouseup', handleColResizeEnd);
        document.body.style.cursor = '';
    }, [handleColResizeMove]);

    const handleColResizeStart = (e: React.MouseEvent, colId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const startWidth = columnWidths[colId] || 200;
        resizingRef.current = { colId, startX: e.pageX, startWidth };
        document.addEventListener('mousemove', handleColResizeMove);
        document.addEventListener('mouseup', handleColResizeEnd);
        document.body.style.cursor = 'col-resize';
    };


    // --- Selection Logic ---
    const toggleRowSelection = (id: string) => {
        const newSet = new Set(selectedRowIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        onSelectRowIds(newSet);
    };

    const toggleAllRows = () => {
        if (selectedRowIds.size === table.rows.length) {
            onSelectRowIds(new Set());
        } else {
            onSelectRowIds(new Set(table.rows.map(r => r.id)));
        }
    };

    // Cell Selection
    const handleCellClick = (e: React.MouseEvent, rowId: string, colId: string) => {
        // Don't select if clicking inside editor
        if (editingCell) return;

        if (e.shiftKey && anchorCell) {
            // Range Selection
            const startRowIdx = table.rows.findIndex(r => r.id === anchorCell.rowId);
            const endRowIdx = table.rows.findIndex(r => r.id === rowId);
            const startColIdx = table.columns.findIndex(c => c.id === anchorCell.colId);
            const endColIdx = table.columns.findIndex(c => c.id === colId);

            if (startRowIdx === -1 || endRowIdx === -1 || startColIdx === -1 || endColIdx === -1) return;

            const minRow = Math.min(startRowIdx, endRowIdx);
            const maxRow = Math.max(startRowIdx, endRowIdx);
            const minCol = Math.min(startColIdx, endColIdx);
            const maxCol = Math.max(startColIdx, endColIdx);

            const newSet = new Set<string>();
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    newSet.add(`${table.rows[r].id}:${table.columns[c].id}`);
                }
            }
            onSelectCellIds(newSet);
        } else {
            // Single Selection
            const newSet = new Set<string>();
            newSet.add(`${rowId}:${colId}`);
            onSelectCellIds(newSet);
            setAnchorCell({ rowId, colId });
        }
    };

    const handleCellDoubleClick = (rowId: string, colId: string) => {
        setEditingCell({ rowId, colId });
        // Also ensure it is selected
        const newSet = new Set<string>();
        newSet.add(`${rowId}:${colId}`);
        onSelectCellIds(newSet);
        setAnchorCell({ rowId, colId });
    };

    // Unified Delete Handling
    const handleUnifiedDelete = () => {
        if (selectedRowIds.size > 0) {
            setConfirmDialog({
                isOpen: true,
                title: '行の削除',
                description: `選択された ${selectedRowIds.size} 件の行を削除しますか？`,
                onConfirm: () => {
                    onUpdateTable(prev => ({
                        ...prev,
                        rows: prev.rows.filter(r => !selectedRowIds.has(r.id))
                    }));
                    onSelectRowIds(new Set());
                    onSelectCellIds(new Set());
                }
            });
        } else if (selectedCellIds.size > 0) {
            // Direct deletion for cells without confirmation (Spreadsheet style)
            onUpdateTable(prev => {
                const newRows = [...prev.rows];
                // Convert Set to Array to ensure type safety during iteration
                (Array.from(selectedCellIds) as string[]).forEach((cellId) => {
                    const [rId, cId] = cellId.split(':');
                    const rowIdx = newRows.findIndex(r => r.id === rId);
                    if (rowIdx !== -1) {
                        newRows[rowIdx] = { ...newRows[rowIdx], [cId]: '' };
                    }
                });
                return { ...prev, rows: newRows };
            });
        }
    };

    // Keyboard Shortcuts (Copy, Delete)
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (editingCell) return; // Let textarea handle events if editing

        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Handle universal delete via keyboard
            handleUnifiedDelete();
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
            // Copy to clipboard
            e.preventDefault();
            if (selectedCellIds.size === 0) return;

            // Need to sort selection to format properly
            const selection = (Array.from(selectedCellIds) as string[]).map(id => {
                const [rId, cId] = id.split(':');
                const rIdx = table.rows.findIndex(r => r.id === rId);
                const cIdx = table.columns.findIndex(c => c.id === cId);
                return { rId, cId, rIdx, cIdx };
            }).sort((a, b) => {
                if (a.rIdx !== b.rIdx) return a.rIdx - b.rIdx;
                return a.cIdx - b.cIdx;
            });

            if (selection.length === 0) return;

            const minR = selection[0].rIdx;
            // const minC = Math.min(...selection.map(s => s.cIdx));

            let clipboardText = "";
            let currentRowIdx = minR;

            selection.forEach((cell, index) => {
                // If new row, add newline (except first)
                if (cell.rIdx !== currentRowIdx) {
                    clipboardText += "\n";
                    currentRowIdx = cell.rIdx;
                } else if (index > 0) {
                    // Same row, tab separate
                    clipboardText += "\t";
                }
                const val = table.rows[cell.rIdx][table.columns[cell.cIdx].id];
                clipboardText += val !== undefined ? String(val) : "";
            });

            navigator.clipboard.writeText(clipboardText);
        }
    }, [selectedCellIds, table, editingCell, selectedRowIds]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Paste Handling
    const handlePaste = useCallback((e: ClipboardEvent) => {
        if (editingCell) return;
        if (!anchorCell) return;

        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain');
        if (!text) return;

        const rows = text.split(/\r\n|\n|\r/);
        if (rows.length === 0) return;

        onUpdateTable(prev => {
            const newTableRows = [...prev.rows];
            const startRowIdx = prev.rows.findIndex(r => r.id === anchorCell.rowId);
            const startColIdx = prev.columns.findIndex(c => c.id === anchorCell.colId);

            if (startRowIdx === -1 || startColIdx === -1) return prev;

            rows.forEach((rowStr: string, rOffset: number) => {
                const targetRowIdx = startRowIdx + rOffset;
                if (targetRowIdx >= newTableRows.length) return;

                const cols = rowStr.split('\t');
                cols.forEach((val, cOffset) => {
                    const targetColIdx = startColIdx + cOffset;
                    if (targetColIdx >= prev.columns.length) return;

                    const targetRow = { ...newTableRows[targetRowIdx] };
                    const targetColId = prev.columns[targetColIdx].id;
                    targetRow[targetColId] = val;
                    newTableRows[targetRowIdx] = targetRow;
                });
            });

            return { ...prev, rows: newTableRows };
        });
    }, [anchorCell, editingCell]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);


    // --- Column Management Logic ---
    const handleAddColumn = () => {
        const newColId = `col_${Date.now()}`;
        const newCol: Column = {
            id: newColId,
            title: `新規カラム`,
            type: 'text',
            description: ''
        };
        onUpdateTable(prev => {
            const newColDef = columnToDefinition(newCol, prev.columns.length);
            return {
                ...prev,
                columns: [...prev.columns, newColDef],
            };
        });
        setEditingCol(newCol);
        setActiveColMenu(newColId);
    };

    const handleUpdateColumn = (updatedCol: Column) => {
        onUpdateTable(prev => ({
            ...prev,
            columns: prev.columns.map(c => {
                if (c.id === updatedCol.id) {
                    return columnToDefinition(updatedCol, c.order);
                }
                return c;
            })
        }));
        setEditingCol(updatedCol);
        setActiveColMenu(null);
    };

    const handleDeleteColumn = (colId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'カラムの削除',
            description: 'このカラムを削除しますか？データは失われます。',
            onConfirm: () => {
                onUpdateTable(prev => ({
                    ...prev,
                    columns: prev.columns.filter(c => c.id !== colId),
                    rows: prev.rows.map(r => {
                        const newRow = { ...r };
                        delete newRow[colId];
                        return newRow;
                    })
                }));
                setActiveColMenu(null);
            }
        });
    };

    // --- CRUD Logic ---
    const handleCellUpdate = (rowId: string, colId: string, value: any) => {
        const updatedRows = table.rows.map(r => {
            if (r.id === rowId) return { ...r, [colId]: value };
            return r;
        });
        onUpdateTable({ ...table, rows: updatedRows });
    };

    const handleAddEmptyRow = () => {
        const newRow: Row = { id: `row_${Date.now()}` };
        table.columns.forEach(c => newRow[c.id] = '');
        onUpdateTable({ ...table, rows: [...table.rows, newRow] });
        setShowAddMenu(false);
    };

    // Text Overflow Controls Logic
    const handleSetTextOverflow = (mode: TextOverflowMode) => {
        if (selectedCellIds.size === 0 && selectedRowIds.size === 0) {
            return;
        }

        // Find affected columns from selected cells
        const affectedColIds = new Set<string>();
        (Array.from(selectedCellIds) as string[]).forEach((cellId) => {
            const [, cId] = cellId.split(':');
            affectedColIds.add(cId);
        });

        onUpdateTable(prev => ({
            ...prev,
            columns: prev.columns.map(c =>
                affectedColIds.has(c.id) ? { ...c, textOverflow: mode } : c
            )
        }));
    };


    // --- Generation Logic with Two-Phase Approach (row-based, shared with WebScraper) ---
    const handleGenerateStart = async () => {
        setShowGenPanel(false);
        setGenPrompt('');
        // 1. Ensure columns (including any new ones) are present
        let currentColumns = [...table.columns];
        const newColsCreated: Column[] = [];

        if (genNewColsString.trim()) {
            const newColNames = genNewColsString.split(',').map(s => s.trim()).filter(s => s);
            const newColDefs: ColumnDefinition[] = [];
            newColNames.forEach((name, idx) => {
                const newCol: Column = {
                    id: `gen_col_${Date.now()}_${idx}`,
                    title: name,
                    type: 'text',
                    description: name
                };
                newColsCreated.push(newCol);
                newColDefs.push(columnToDefinition(newCol, currentColumns.length + idx));
            });
            currentColumns = [...currentColumns, ...newColDefs];
            onUpdateTable(prev => ({ ...prev, columns: currentColumns }));
            newColsCreated.forEach(c => genSelectedColIds.add(c.id));
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

    // --- Enrichment Logic (row-based, using shared company service) ---
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

    return (
        <div className="h-full flex flex-col bg-white font-sans relative outline-none" ref={containerRef} tabIndex={0}>
            {/* --- Toolbar --- */}
            <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-sm font-bold text-[#323232] flex items-center gap-2">
                            <IconDatabase className="w-4 h-4 text-gray-400" />
                            {table.name}
                        </h2>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                        <span>{table.rows.length} 行</span>
                        <span>•</span>
                        <span>{table.columns.length} カラム</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">

                    {/* Text Overflow Controls */}
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md border border-gray-100">
                        <button
                            onClick={() => handleSetTextOverflow('wrap')}
                            className="p-1 rounded hover:bg-white hover:shadow-sm text-gray-500 hover:text-black transition-all"
                            title="テキストを折り返す"
                        >
                            <IconWrapText className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleSetTextOverflow('clip')}
                            className="p-1 rounded hover:bg-white hover:shadow-sm text-gray-500 hover:text-black transition-all"
                            title="はみ出しを隠す"
                        >
                            <IconClip className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleSetTextOverflow('visible')}
                            className="p-1 rounded hover:bg-white hover:shadow-sm text-gray-500 hover:text-black transition-all"
                            title="はみ出しを表示"
                        >
                            <IconOverflowVisible className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="h-4 w-px bg-gray-200 mx-1"></div>

                    {/* Multi-Filter Menu */}
                    <div className="relative" ref={filterMenuRef}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-2 ${activeFilters.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-[#323232] hover:bg-gray-100'}`}
                            title="フィルタ"
                        >
                            <IconFilter className="w-4 h-4" />
                            {activeFilters.length > 0 && <span className="text-xs font-bold">{activeFilters.length}</span>}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#DEE1E7] shadow-xl rounded p-0 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-3 border-b border-[#DEE1E7] bg-[#0A0B0D]">
                                    <h4 className="text-xs font-bold uppercase text-white tracking-wider">フィルタリング</h4>
                                </div>
                                <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
                                    {activeFilters.length === 0 && (
                                        <p className="text-xs text-[#B1B7C3] italic">有効なフィルタはありません</p>
                                    )}
                                    {activeFilters.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs bg-[#EEF0F3] p-2 rounded border border-[#DEE1E7]">
                                            <span className="font-bold text-[#0A0B0D]">{table.columns.find(c => c.id === f.columnId)?.name}</span>
                                            <span className="text-[#717886]">{f.operator}</span>
                                            <span className="text-[#0A0B0D] bg-white px-1 rounded border border-[#DEE1E7]">{f.value}</span>
                                            <button
                                                onClick={() => onUpdateFilters(activeFilters.filter((_, i) => i !== idx))}
                                                className="ml-auto text-[#B1B7C3] hover:text-[#FC401F]"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 border-t border-[#DEE1E7] bg-[#EEF0F3] space-y-2">
                                    <p className="text-[10px] font-bold text-[#717886] uppercase tracking-wider">新規フィルタ追加</p>
                                    <CustomSelect
                                        value={newFilter.columnId}
                                        onChange={(v) => setNewFilter({ ...newFilter, columnId: v })}
                                        options={table.columns.map(c => ({ value: c.id, label: c.name }))}
                                    />
                                    <div className="flex gap-2">
                                        <CustomSelect
                                            className="flex-1"
                                            value={newFilter.operator}
                                            onChange={(v) => setNewFilter({ ...newFilter, operator: v as any })}
                                            options={[
                                                { value: 'contains', label: 'を含む' },
                                                { value: 'equals', label: 'と等しい' },
                                                { value: 'greater', label: 'より大きい' },
                                                { value: 'less', label: 'より小さい' },
                                            ]}
                                        />
                                        <input
                                            className="flex-1 text-xs border border-[#DEE1E7] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#0000FF] bg-white text-[#0A0B0D] h-9"
                                            placeholder="値..."
                                            value={newFilter.value}
                                            onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (newFilter.columnId) {
                                                onUpdateFilters([...activeFilters, newFilter]);
                                                setNewFilter({ ...newFilter, value: '' });
                                            }
                                        }}
                                        disabled={!newFilter.columnId || !newFilter.value}
                                        className="w-full bg-[#0000FF] text-white text-xs font-bold py-2 rounded hover:bg-[#0000CC] disabled:opacity-50 transition-colors"
                                    >
                                        フィルタを追加
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-px bg-gray-200 mx-1"></div>



                    {/* Multi-Sort Menu */}
                    <div className="relative" ref={sortMenuRef}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`p-1.5 rounded transition-colors flex items-center gap-2 ${activeSorts.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-[#323232] hover:bg-gray-100'}`}
                            title="並べ替え"
                        >
                            <IconSort className="w-4 h-4" />
                            {activeSorts.length > 0 && <span className="text-xs font-bold">{activeSorts.length}</span>}
                        </button>
                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#DEE1E7] shadow-xl rounded p-0 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-3 border-b border-[#DEE1E7] bg-[#0A0B0D]">
                                    <h4 className="text-xs font-bold uppercase text-white tracking-wider">並べ替えルール</h4>
                                </div>
                                <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
                                    {activeSorts.length === 0 && (
                                        <p className="text-xs text-[#B1B7C3] italic">有効な並べ替えはありません</p>
                                    )}
                                    {activeSorts.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs bg-[#EEF0F3] p-2 rounded border border-[#DEE1E7]">
                                            <span className="text-[10px] text-[#717886] font-mono mr-1">{idx + 1}.</span>
                                            <span className="font-bold text-[#0A0B0D]">{table.columns.find(c => c.id === s.columnId)?.name}</span>
                                            <span className="text-[#0000FF] bg-white px-1 rounded border border-[#DEE1E7] text-[10px] uppercase font-bold">{s.direction}</span>
                                            <button
                                                onClick={() => onUpdateSorts(activeSorts.filter((_, i) => i !== idx))}
                                                className="ml-auto text-[#B1B7C3] hover:text-[#FC401F]"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-[#DEE1E7] bg-[#EEF0F3] space-y-2">
                                    <p className="text-[10px] font-bold text-[#717886] uppercase tracking-wider">新規ルール追加</p>
                                    <CustomSelect
                                        value={newSort.columnId}
                                        onChange={(v) => setNewSort({ ...newSort, columnId: v })}
                                        options={table.columns.map(c => ({ value: c.id, label: c.name }))}
                                    />
                                    <CustomSelect
                                        value={newSort.direction}
                                        onChange={(v) => setNewSort({ ...newSort, direction: v as any })}
                                        options={[
                                            { value: 'asc', label: '昇順 (Ascending)' },
                                            { value: 'desc', label: '降順 (Descending)' },
                                        ]}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newSort.columnId) {
                                                const existing = activeSorts.filter(s => s.columnId !== newSort.columnId);
                                                onUpdateSorts([...existing, newSort]);
                                            }
                                        }}
                                        disabled={!newSort.columnId}
                                        className="w-full bg-[#0000FF] text-white text-xs font-bold py-2 rounded hover:bg-[#0000CC] disabled:opacity-50 transition-colors"
                                    >
                                        並べ替えを追加
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-px bg-gray-200 mx-1"></div>

                    <div className="relative" ref={enrichPanelRef}>
                        <button
                            onClick={() => {
                                if (selectedRowIds.size === 0) {
                                    alert("エンリッチする行を選択してください。");
                                    return;
                                }
                                setShowEnrichPanel(!showEnrichPanel);
                                setShowGenPanel(false);
                            }}
                            disabled={selectedRowIds.size === 0}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-md transition-all
                                ${selectedRowIds.size > 0
                                    ? 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'
                                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <IconSparkles className="w-3.5 h-3.5" />
                            AIエンリッチ
                        </button>

                        {/* Enrichment Panel */}
                        {showEnrichPanel && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="p-3 border-b border-gray-100 bg-[#f2f2f2] flex justify-between items-center">
                                    <span className="text-xs font-bold text-[#323232] uppercase">更新するカラムを選択</span>
                                    <button onClick={() => setShowEnrichPanel(false)} className="text-gray-400 hover:text-gray-600"><IconX className="w-3 h-3" /></button>
                                </div>
                                <div className="p-2 max-h-60 overflow-y-auto">
                                    {table.columns.map(definitionToColumn).filter(col => !isPlaceholderColumn(col)).map(col => (
                                        <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="accent-purple-600 rounded border-gray-300"
                                                checked={enrichTargetCols.has(col.id)}
                                                onChange={() => {
                                                    const next = new Set(enrichTargetCols);
                                                    if (next.has(col.id)) next.delete(col.id);
                                                    else next.add(col.id);
                                                    setEnrichTargetCols(next);
                                                }}
                                            />
                                            <span className="text-sm text-[#323232]">{col.title}</span>
                                            <span className="text-[10px] text-gray-400 font-mono uppercase ml-auto">{col.type}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-gray-100 bg-[#f2f2f2] space-y-2">
                                    {enrichTargetCols.size > 0 && (
                                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                                            <IconInfo className="w-3.5 h-3.5" />
                                            <span>選択された {selectedRowIds.size} 行 × {enrichTargetCols.size} カラムのエンリッチを実行します</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleEnrichmentStart}
                                        disabled={enrichTargetCols.size === 0}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded disabled:opacity-50"
                                    >
                                        エンリッチ実行
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Add Button */}
                    <div className="relative" ref={addMenuRef}>
                        <button
                            onClick={() => {
                                setShowAddMenu(!showAddMenu);
                                setShowEnrichPanel(false);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#323232] text-white text-xs font-bold uppercase tracking-wider hover:bg-black rounded-md transition-colors shadow-sm"
                        >
                            <IconPlus className="w-3.5 h-3.5" />
                            追加
                        </button>

                        {showAddMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <div className="py-1">
                                    <button onClick={handleAddEmptyRow} className="w-full text-left px-4 py-2 text-sm text-[#323232] hover:bg-[#f2f2f2] flex items-center gap-2">
                                        <IconPlus className="w-3 h-3 text-gray-400" /> 空の行
                                    </button>
                                    <button
                                        onClick={() => { setShowGenPanel(true); setShowAddMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                    >
                                        <IconBolt className="w-3 h-3 text-blue-500" /> AIで生成
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Unified Delete Button */}
                    {(selectedCellIds.size > 0 || selectedRowIds.size > 0) && (
                        <button
                            onClick={handleUnifiedDelete}
                            className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 rounded-md transition-colors shadow-sm"
                            title="削除 / クリア"
                        >
                            <IconTrash className="w-4 h-4" />
                        </button>
                    )}


                    {/* Generation Config Panel */}
                    {showGenPanel && (
                        <div ref={genPanelRef} className="absolute right-0 top-16 mr-4 w-96 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#f2f2f2] shrink-0">
                                <div className="flex items-center gap-2">
                                    <IconBolt className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-bold text-[#323232] text-sm">AIデータ生成</h3>
                                </div>
                                <button onClick={() => setShowGenPanel(false)} className="text-gray-400 hover:text-black"><IconX className="w-3.5 h-3.5" /></button>
                            </div>

                            <div className="p-4 space-y-5 overflow-y-auto">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">プロンプト</label>
                                    <textarea
                                        value={genPrompt}
                                        onChange={(e) => setGenPrompt(e.target.value)}
                                        className="w-full border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md resize-none text-[#323232]"
                                        rows={2}
                                        placeholder="例: 東京のトップSaaS企業..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">生成数: {genCount}</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={genCount}
                                        onChange={(e) => setGenCount(parseInt(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">出力カラム</label>
                                    <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-md p-1 bg-[#f2f2f2]">
                                        {table.columns.map(definitionToColumn).filter(col => !isPlaceholderColumn(col)).map(col => (
                                            <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="accent-blue-600 rounded border-gray-300"
                                                    checked={genSelectedColIds.has(col.id)}
                                                    onChange={() => {
                                                        const next = new Set(genSelectedColIds);
                                                        if (next.has(col.id)) next.delete(col.id);
                                                        else next.add(col.id);
                                                        setGenSelectedColIds(next);
                                                    }}
                                                />
                                                <span className="text-xs text-[#323232] truncate">{col.title}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">新しいカラムを追加 (カンマ区切り)</label>
                                    <input
                                        type="text"
                                        value={genNewColsString}
                                        onChange={(e) => setGenNewColsString(e.target.value)}
                                        className="w-full border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-[#323232]"
                                        placeholder="例: 設立年, 従業員数"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateStart}
                                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    生成を実行
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(prev => ({ ...prev, isOpen: false })); }}>
                                実行
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Generation Progress Banner */}
            {
                generationProgress && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 px-4 py-3">
                        <div className="flex items-center gap-3">
                            {/* Phase indicator */}
                            {generationProgress.phase === 'generating_names' && (
                                <>
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-blue-900">企業名を生成中...</div>
                                        <div className="text-xs text-blue-700">Google検索で実在する企業を探しています</div>
                                    </div>
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                </>
                            )}
                            {generationProgress.phase === 'enriching_details' && (
                                <>
                                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-purple-900">
                                            詳細情報をエンリッチ中... ({generationProgress.currentRow || 0}/{generationProgress.totalRows})
                                        </div>
                                        <div className="text-xs text-purple-700">
                                            {generationProgress.currentColumn && `${generationProgress.currentColumn}を取得中`}
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-48 h-2 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-600 transition-all duration-300"
                                            style={{
                                                width: `${((generationProgress.currentRow || 0) / generationProgress.totalRows) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-mono text-purple-700">
                                        {Math.round(((generationProgress.currentRow || 0) / generationProgress.totalRows) * 100)}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* --- Table Content --- */}
            <div className="flex-1 overflow-auto bg-[#f2f2f2] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent select-none overscroll-x-none" style={{ overscrollBehaviorX: 'none' }}>
                <table className="w-max table-fixed border-collapse text-sm bg-white">
                    <thead className="sticky top-0 z-30 bg-white shadow-sm">
                        <tr>
                            {/* Fixed Width Checkbox Column */}
                            <th className="w-[48px] min-w-[48px] max-w-[48px] p-0 border-b border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky left-0 z-40">
                                <div className="flex items-center justify-center h-full w-full">
                                    <input
                                        type="checkbox"
                                        checked={selectedRowIds.size === table.rows.length && table.rows.length > 0}
                                        onChange={toggleAllRows}
                                        className="accent-blue-600 w-3.5 h-3.5 cursor-pointer border-gray-300 rounded"
                                    />
                                </div>
                            </th>

                            {/* Data Columns */}
                            {table.columns.map((col, index) => (
                                <th
                                    key={col.id}
                                    style={{ width: columnWidths[col.id] || 200 }}
                                    className="min-w-[50px] p-0 border-b border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm text-left relative group"
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Column Letter Header */}
                                        <div className="text-[10px] text-gray-400 font-mono text-center border-b border-gray-100 bg-gray-50/50 py-0.5">
                                            {getColumnLetter(index)}
                                        </div>

                                        <div
                                            className="px-3 py-2 flex items-center gap-2 flex-1 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                                            onClick={() => {
                                                if (activeColMenu === col.id) {
                                                    setActiveColMenu(null);
                                                } else {
                                                    setEditingCol(definitionToColumn(col));
                                                    setActiveColMenu(col.id);
                                                }
                                            }}
                                        >
                                            <span className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold uppercase shrink-0
                                                ${col.type === 'number' ? 'bg-purple-50 text-purple-600' :
                                                    col.type === 'url' ? 'bg-blue-50 text-blue-600' :
                                                        col.type === 'tag' ? 'bg-green-50 text-green-600' :
                                                            'bg-gray-100 text-gray-600'}`}>
                                                {col.type === 'text' ? 'TXT' : col.type === 'number' ? 'NUM' : col.type === 'url' ? 'URL' : col.type === 'tag' ? 'TAG' : 'DAT'}
                                            </span>
                                            <span className="font-semibold text-xs tracking-wide text-[#323232] truncate flex-1">{col.name}</span>

                                            {/* Show Sort Indicator */}
                                            {activeSorts.find(s => s.columnId === col.id) && (
                                                <span className="text-blue-600 text-[10px] font-bold flex items-center bg-blue-50 rounded px-1 shrink-0">
                                                    {activeSorts.find(s => s.columnId === col.id)?.direction === 'asc' ? '▲' : '▼'}
                                                    <span className="ml-0.5 text-[8px]">{activeSorts.findIndex(s => s.columnId === col.id) + 1}</span>
                                                </span>
                                            )}

                                            <IconSettings className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 shrink-0" />
                                        </div>
                                    </div>

                                    {/* Column Menu Popover */}
                                    {activeColMenu === col.id && editingCol && (
                                        <div
                                            ref={colMenuRef}
                                            className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-xl z-50 p-0 animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="p-3 space-y-3 bg-white">
                                                <input
                                                    value={editingCol.title}
                                                    onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value })}
                                                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white text-[#323232]"
                                                    placeholder="カラム名"
                                                />
                                                <CustomSelect
                                                    value={editingCol.type}
                                                    onChange={(v) => setEditingCol({ ...editingCol, type: v as ColumnType })}
                                                    options={[
                                                        { value: 'text', label: 'テキスト' },
                                                        { value: 'number', label: '数値' },
                                                        { value: 'tag', label: 'タグ' },
                                                        { value: 'url', label: 'URL' },
                                                        { value: 'date', label: '日付' },
                                                        { value: 'email', label: 'Eメール' },
                                                    ]}
                                                />
                                            </div>

                                            <div className="h-px bg-gray-100"></div>

                                            <div className="p-1">
                                                <button
                                                    onClick={() => {
                                                        onUpdateSorts([...activeSorts.filter(s => s.columnId !== col.id), { columnId: col.id, direction: 'asc' }]);
                                                        setActiveColMenu(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#f2f2f2] rounded text-[#323232]"
                                                >
                                                    昇順で並べ替え (Asc)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onUpdateSorts([...activeSorts.filter(s => s.columnId !== col.id), { columnId: col.id, direction: 'desc' }]);
                                                        setActiveColMenu(null);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#f2f2f2] rounded text-[#323232]"
                                                >
                                                    降順で並べ替え (Desc)
                                                </button>
                                            </div>

                                            <div className="h-px bg-gray-100"></div>

                                            <div className="p-3 flex gap-2 bg-gray-50">
                                                <button
                                                    onClick={() => { handleUpdateColumn(editingCol); setActiveColMenu(null); }}
                                                    className="flex-1 bg-[#323232] text-white text-xs font-bold py-2 rounded hover:bg-black"
                                                >
                                                    更新
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteColumn(col.id)}
                                                    className="px-3 bg-white border border-gray-200 text-red-500 rounded hover:bg-red-50"
                                                >
                                                    <IconTrash className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Resize Handle */}
                                    <div
                                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 transition-colors z-10"
                                        onMouseDown={(e) => handleColResizeStart(e, col.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    ></div>
                                </th>
                            ))}

                            <th className="w-24 p-0 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm align-middle">
                                <button
                                    onClick={handleAddColumn}
                                    className="w-full h-full flex items-center justify-center gap-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <IconPlus className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase">New</span>
                                </button>
                            </th>
                            <th className="border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.rows.map((row, index) => {
                            const isGenerating = generatingRowIds.has(row.id);
                            const isRowSelected = selectedRowIds.has(row.id);

                            return (
                                <tr
                                    key={row.id}
                                    className={`group transition-colors h-10
                                        ${isRowSelected ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50'}
                                        ${isGenerating ? 'animate-pulse bg-gray-50' : ''}
                                    `}
                                >
                                    <td className="border-b border-r border-gray-100 p-0 text-center sticky left-0 z-20 bg-white group-hover:bg-gray-50">
                                        <div className="w-full h-10 flex items-center justify-center relative">
                                            <span className={`text-[10px] font-mono text-gray-400 ${isRowSelected ? 'hidden' : 'group-hover:hidden'}`}>
                                                {index + 1}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={isRowSelected}
                                                onChange={() => toggleRowSelection(row.id)}
                                                className={`accent-blue-600 w-3.5 h-3.5 cursor-pointer border-gray-300 rounded absolute ${isRowSelected ? 'block' : 'hidden group-hover:block'}`}
                                            />
                                        </div>
                                    </td>

                                    {table.columns.map(col => {
                                        const cellKey = `${row.id}-${col.id}`;
                                        const isLoading = loadingCells.has(cellKey);
                                        const cellId = `${row.id}:${col.id}`;
                                        const isSelected = selectedCellIds.has(cellId);
                                        const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                                        const rawValue = row[col.id];

                                        // Check enrichment progress
                                        const progress = enrichmentProgress.get(cellKey);

                                        let displayValue = rawValue;
                                        if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
                                            displayValue = evaluateFormula(rawValue, row, table.columns.map(definitionToColumn));
                                        }

                                        // Determine phase display
                                        let phaseDisplay = null;
                                        if (progress && progress.phase !== 'complete') {
                                            const phaseLabels: Record<string, string> = {
                                                'discovery': '検索中',
                                                'extraction': '抽出中',
                                                'financial': '財務情報',
                                                'error': 'エラー'
                                            };
                                            const phaseColors: Record<string, string> = {
                                                'discovery': 'text-blue-600',
                                                'extraction': 'text-purple-600',
                                                'financial': 'text-green-600',
                                                'error': 'text-red-600'
                                            };

                                            phaseDisplay = (
                                                <div className="w-full h-full flex items-center px-3 gap-2">
                                                    <span className={phaseColors[progress.phase]}>
                                                        {progress.phase === 'discovery' && <IconSearch className="w-3.5 h-3.5 animate-pulse" />}
                                                        {progress.phase === 'extraction' && <IconFileText className="w-3.5 h-3.5 animate-pulse" />}
                                                        {progress.phase === 'financial' && <IconDatabase className="w-3.5 h-3.5 animate-pulse" />}
                                                        {progress.phase === 'error' && <IconAlertTriangle className="w-3.5 h-3.5" />}
                                                    </span>
                                                    <span className={`text-xs font-mono ${phaseColors[progress.phase]}`}>
                                                        {phaseLabels[progress.phase]}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <td
                                                key={cellId}
                                                className={`border-b border-r border-gray-100 relative h-10 p-0 box-border
                                                    ${isSelected && !isEditing ? 'ring-2 ring-inset ring-blue-500 bg-blue-50' : ''}
                                                `}
                                                onClick={(e) => handleCellClick(e, row.id, col.id)}
                                                onDoubleClick={() => handleCellDoubleClick(row.id, col.id)}
                                                style={{ verticalAlign: 'top', height: '40px', width: columnWidths[col.id] || 200 }}
                                            >
                                                {phaseDisplay ? phaseDisplay : isLoading ? (
                                                    <div className="w-full h-full flex items-center px-3">
                                                        <div className="h-2 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                                                    </div>
                                                ) : isEditing ? (
                                                    <textarea
                                                        autoFocus
                                                        className="absolute inset-0 w-full h-full px-3 py-2.5 text-sm bg-white outline-none font-sans text-[#323232] resize-none shadow-lg border-2 border-blue-600 z-50"
                                                        value={rawValue || ''}
                                                        onChange={(e) => handleCellUpdate(row.id, col.id, e.target.value)}
                                                        onBlur={() => setEditingCell(null)}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation(); // Prevent global keys from triggering
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                setEditingCell(null);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={`px-3 py-2.5 w-full h-full text-[#323232] text-sm 
                                                        ${col.textOverflow === 'wrap' ? 'whitespace-normal break-words leading-snug' :
                                                            col.textOverflow === 'visible' ? 'whitespace-nowrap overflow-visible z-10 bg-transparent relative' :
                                                                col.textOverflow === 'clip' ? 'whitespace-nowrap overflow-hidden' :
                                                                    'whitespace-nowrap truncate'}
                                                    `}>
                                                        {renderCell(displayValue, col.type)}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="border-b border-gray-100 bg-gray-50/10"></td>
                                    <td className="border-b border-gray-100 text-center"></td>
                                </tr>
                            );
                        })}

                        <tr>
                            <td className="sticky left-0 z-20 bg-white border-r border-gray-200"></td>
                            <td colSpan={table.columns.length + 2} className="p-0">
                                <button
                                    onClick={handleAddEmptyRow}
                                    className="w-full py-2.5 text-xs font-mono text-gray-400 hover:text-blue-600 hover:bg-blue-50/30 border-b border-dashed border-gray-200 transition-colors text-left px-3 flex items-center gap-2"
                                >
                                    <IconPlus className="w-3 h-3" /> 行を追加
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
};

const renderCell = (value: any, type: string) => {
    if (value === undefined || value === null || value === '') return <span className="text-gray-300 text-[10px] italic select-none"></span>;

    switch (type) {
        case 'url':
            return (
                <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline block font-mono" onClick={(e) => e.stopPropagation()}>
                    {String(value).replace(/^https?:\/\//, '')}
                </a>
            );
        case 'tag':
            return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f2f2f2] text-gray-700 border border-gray-200 uppercase tracking-wider">{value}</span>;
        case 'number':
            return <span className="font-mono text-[#323232]">{value}</span>;
        case 'date':
            return <span className="font-mono text-gray-600">{value}</span>;
        default:
            return <span>{String(value)}</span>;
    }
};
