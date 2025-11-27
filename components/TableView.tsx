import React, { useState, useRef, useEffect } from 'react';
import { TableData, SortState, Filter, TextOverflowMode } from '@/types';
import { definitionToColumn } from '@/core/models/column';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/primitives/alert-dialog";

// Hooks
import { useTableSelection } from './table/hooks/useTableSelection';
import { useTableColumns } from './table/hooks/useTableColumns';
import { useTableData } from './table/hooks/useTableData';
import { useTableSort } from './table/hooks/useTableSort';
import { useTableFilter } from './table/hooks/useTableFilter';
import { useTableImport } from './table/hooks/useTableImport';
import { useTableAI } from './table/hooks/useTableAI';
import { useAuth } from '@/contexts/AuthContext';

// UI Components
import { TableToolbar } from './table/ui/TableToolbar';
import { TableHeader } from './table/ui/TableHeader';
import { TableBody } from './table/ui/TableBody';
import { ExcelImportModal } from './table/ui/ExcelImportModal';
import { SendEmailModal } from '@/features/contact/components/SendEmailModal';
import { detectEmailColumns, isValidEmail } from '@/services/email/gmail.service';
import { IconMail } from './Icons';

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
    const { user, currentOrganization } = useAuth();
    
    // Local State
    const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [displayTable, setDisplayTable] = useState<TableData>(table);
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
    
    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        rowId: string;
        colId: string;
        value: any;
    } | null>(null);
    
    // Send Email Modal State
    const [showSendEmailModal, setShowSendEmailModal] = useState(false);

    // Refs
    const colMenuRef = useRef<HTMLDivElement>(null);

    // Ensure minimum 10 columns and 50 rows (add placeholders if needed)
    useEffect(() => {
        let columns = table.columns;
        let rows = table.rows;

        // Add placeholder columns if fewer than 10
        if (table.columns.length < 10) {
            const placeholderColumns = [];
            const startIndex = table.columns.length;

            for (let i = startIndex; i < 10; i++) {
                const letter = getColumnLetter(i);
                placeholderColumns.push({
                    id: `placeholder_col_${letter}`,
                    name: `Column ${letter}`,
                    type: 'text' as const,
                    order: i,
                    textOverflow: 'clip' as const,
                    isPlaceholder: true
                });
            }
            columns = [...table.columns, ...placeholderColumns];
        }

        // Add placeholder rows if fewer than 50
        if (table.rows.length < 50) {
            const placeholderRows = [];
            const startIndex = table.rows.length;

            for (let i = startIndex; i < 50; i++) {
                const placeholderRow: any = {
                    id: `placeholder_row_${i + 1}`,
                    isPlaceholder: true
                };
                // Initialize all column values to empty
                columns.forEach(col => {
                    placeholderRow[col.id] = '';
                });
                placeholderRows.push(placeholderRow);
            }
            rows = [...table.rows, ...placeholderRows];
        }

        setDisplayTable({
            ...table,
            columns,
            rows
        });
    }, [table]);

    // Helper function to convert column index to spreadsheet letter (same as in TableHeader)
    const getColumnLetter = (index: number): string => {
        let letter = '';
        let num = index;

        while (num >= 0) {
            letter = String.fromCharCode(65 + (num % 26)) + letter;
            num = Math.floor(num / 26) - 1;
        }

        return letter;
    };

    // Hooks
    const selection = useTableSelection({
        table,
        selectedRowIds,
        onSelectRowIds,
        selectedCellIds,
        onSelectCellIds,
        editingCell,
        setEditingCell
    });

    const columns = useTableColumns({
        table,
        onUpdateTable,
        setConfirmDialog
    });

    const data = useTableData({
        table,
        onUpdateTable,
        selectedRowIds,
        onSelectRowIds,
        selectedCellIds,
        onSelectCellIds,
        setConfirmDialog,
        setShowAddMenu
    });

    const sort = useTableSort({
        activeSorts,
        onUpdateSorts
    });

    const filter = useTableFilter({
        activeFilters,
        onUpdateFilters
    });

    const importLogic = useTableImport({
        table,
        onUpdateTable
    });

    const ai = useTableAI({
        table,
        onUpdateTable,
        selectedRowIds
    });

    // Context menu handler
    const handleCellContextMenu = (e: React.MouseEvent, rowId: string, colId: string, value: any) => {
        e.preventDefault();
        
        // Check if this is an email column
        const column = table.columns.find(c => c.id === colId);
        const isEmailColumn = column && (
            column.type === 'email' ||
            /email|mail|メール/i.test(column.name)
        );
        
        // Check if value is a valid email
        const hasValidEmail = isEmailColumn && isValidEmail(String(value || ''));
        
        if (hasValidEmail) {
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                rowId,
                colId,
                value,
            });
            
            // Select this cell
            onSelectCellIds(new Set([`${rowId}:${colId}`]));
        }
    };

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [contextMenu]);

    // Handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is inside the menu OR inside a Radix portal (dropdown content)
            // Radix Select content has role="listbox", and is rendered in a portal
            const isInsideMenu = colMenuRef.current && colMenuRef.current.contains(target);
            const isInsidePortal = target.closest('[role="listbox"]') || target.closest('[data-radix-focus-guard]');

            if (!isInsideMenu && !isInsidePortal) {
                columns.setActiveColMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [columns]);

    // Keyboard shortcuts for copy/paste/delete/typing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if we're in an input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Single-click to type: If a cell is selected but not editing, and user types a printable character
            if (selectedCellIds.size > 0 && !editingCell && !e.metaKey && !e.ctrlKey && !e.altKey) {
                // Check if it's a printable character (not a special key)
                const isPrintable = e.key.length === 1 || e.key === 'Enter';
                const isNavigationKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape'].includes(e.key);
                const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace';

                if (isPrintable && !isNavigationKey && !isDeleteKey) {
                    e.preventDefault();
                    const cellId = Array.from(selectedCellIds)[0];
                    const [rowId, colId] = cellId.split(':');

                    // Enter edit mode with the typed character
                    setEditingCell({ rowId, colId });

                    // Update the cell value with the typed character
                    if (e.key !== 'Enter') {
                        onUpdateTable(prev => ({
                            ...prev,
                            rows: prev.rows.map(r =>
                                r.id === rowId ? { ...r, [colId]: e.key } : r
                            )
                        }));
                    }
                }
            }

            // Copy (Cmd/Ctrl + C)
            if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedCellIds.size > 0) {
                e.preventDefault();
                const cellData: string[][] = [];
                const cellArray = Array.from(selectedCellIds);

                // Group by row
                const rowMap = new Map<string, Map<string, string>>();
                cellArray.forEach(cellId => {
                    const [rowId, colId] = cellId.split(':');
                    if (!rowMap.has(rowId)) {
                        rowMap.set(rowId, new Map());
                    }
                    const row = table.rows.find(r => r.id === rowId);
                    if (row) {
                        rowMap.get(rowId)!.set(colId, String(row[colId] || ''));
                    }
                });

                // Convert to TSV (Tab-Separated Values)
                const tsvData = Array.from(rowMap.values())
                    .map(colMap => Array.from(colMap.values()).join('\t'))
                    .join('\n');

                navigator.clipboard.writeText(tsvData);
            }

            // Paste (Cmd/Ctrl + V)
            if ((e.metaKey || e.ctrlKey) && e.key === 'v' && selectedCellIds.size > 0) {
                e.preventDefault();
                navigator.clipboard.readText().then(text => {
                    const cellArray = Array.from(selectedCellIds);
                    if (cellArray.length > 0) {
                        const [startRowId, startColId] = cellArray[0].split(':');
                        const startRowIdx = table.rows.findIndex(r => r.id === startRowId);
                        const startColIdx = table.columns.findIndex(c => c.id === startColId);

                        if (startRowIdx !== -1 && startColIdx !== -1) {
                            const rows = text.split('\n');
                            onUpdateTable(prev => {
                                const newRows = [...prev.rows];
                                rows.forEach((row, rIdx) => {
                                    const targetRowIdx = startRowIdx + rIdx;
                                    if (targetRowIdx < newRows.length) {
                                        const values = row.split('\t');
                                        values.forEach((value, cIdx) => {
                                            const targetColIdx = startColIdx + cIdx;
                                            if (targetColIdx < prev.columns.length) {
                                                const colId = prev.columns[targetColIdx].id;
                                                newRows[targetRowIdx] = {
                                                    ...newRows[targetRowIdx],
                                                    [colId]: value
                                                };
                                            }
                                        });
                                    }
                                });
                                return { ...prev, rows: newRows };
                            });
                        }
                    }
                });
            }

            // Delete (Delete or Backspace)
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCellIds.size > 0 && !editingCell) {
                e.preventDefault();
                data.handleUnifiedDelete();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedCellIds, table, onUpdateTable, editingCell, data, setEditingCell]);

    return (
        <div className="flex flex-col h-full bg-white">
            <TableToolbar
                table={displayTable}
                onUpdateTable={onUpdateTable}
                selectedRowIds={selectedRowIds}
                selectedCellIds={selectedCellIds}

                // Sort
                showSortMenu={sort.showSortMenu}
                setShowSortMenu={sort.setShowSortMenu}
                activeSorts={activeSorts}
                newSort={sort.newSort}
                setNewSort={sort.setNewSort}
                addSort={sort.addSort}
                onUpdateSorts={onUpdateSorts}

                // Filter
                showFilterMenu={filter.showFilterMenu}
                setShowFilterMenu={filter.setShowFilterMenu}
                activeFilters={activeFilters}
                newFilter={filter.newFilter}
                setNewFilter={filter.setNewFilter}
                addFilter={filter.addFilter}
                removeFilter={filter.removeFilter}

                // AI Generation
                showGenPanel={ai.showGenPanel}
                setShowGenPanel={ai.setShowGenPanel}
                genPrompt={ai.genPrompt}
                setGenPrompt={ai.setGenPrompt}
                genCount={ai.genCount}
                setGenCount={ai.setGenCount}
                genSelectedColIds={ai.genSelectedColIds}
                setGenSelectedColIds={ai.setGenSelectedColIds}
                genNewColsString={ai.genNewColsString}
                setGenNewColsString={ai.setGenNewColsString}
                handleGenerateStart={ai.handleGenerateStart}
                generationProgress={ai.generationProgress}

                // AI Enrichment
                showEnrichPanel={ai.showEnrichPanel}
                setShowEnrichPanel={ai.setShowEnrichPanel}
                enrichTargetCols={ai.enrichTargetCols}
                setEnrichTargetCols={ai.setEnrichTargetCols}
                handleEnrichmentStart={ai.handleEnrichmentStart}
                enrichmentProgress={ai.enrichmentProgress}

                // Import
                handleFileSelected={importLogic.handleFileSelected}

                // Actions
                handleAddEmptyRow={data.handleAddEmptyRow}
                handleUnifiedDelete={data.handleUnifiedDelete}

                // Add Menu
                showAddMenu={showAddMenu}
                setShowAddMenu={setShowAddMenu}
                
                // Email
                onSendEmailClick={() => setShowSendEmailModal(true)}
                hasEmailColumn={detectEmailColumns(table.columns).length > 0}
            />

            <div className="flex-1 overflow-auto relative">
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                    <TableHeader
                        table={displayTable}
                        columnWidths={columns.columnWidths}
                        activeSorts={activeSorts}
                        activeColMenu={columns.activeColMenu}
                        setActiveColMenu={columns.setActiveColMenu}
                        editingCol={columns.editingCol}
                        setEditingCol={columns.setEditingCol}
                        handleUpdateColumn={columns.handleUpdateColumn}
                        handleDeleteColumn={columns.handleDeleteColumn}
                        handleColResizeStart={columns.handleColResizeStart}
                        handleAddColumn={columns.handleAddColumn}
                        handleAddColumnAt={columns.handleAddColumnAt}
                        toggleAllRows={selection.toggleAllRows}
                        isAllSelected={selectedRowIds.size === displayTable.rows.filter(r => !r.isPlaceholder).length && displayTable.rows.filter(r => !r.isPlaceholder).length > 0}
                        colMenuRef={colMenuRef as React.RefObject<HTMLDivElement>}
                    />
                    <TableBody
                        table={displayTable}
                        selectedRowIds={selectedRowIds}
                        toggleRowSelection={selection.toggleRowSelection}
                        generatingRowIds={ai.generatingRowIds}
                        loadingCells={loadingCells}
                        selectedCellIds={selectedCellIds}
                        editingCell={editingCell}
                        enrichmentProgress={ai.enrichmentProgress}
                        columnWidths={columns.columnWidths}
                        handleCellClick={selection.handleCellClick}
                        handleCellDoubleClick={(rowId, colId) => {
                            setEditingCell({ rowId, colId });
                            selection.handleCellDoubleClick(rowId, colId);
                        }}
                        handleCellUpdate={data.handleCellUpdate}
                        setEditingCell={setEditingCell}
                        handleAddEmptyRow={data.handleAddEmptyRow}
                        onCellContextMenu={handleCellContextMenu}
                    />
                </table>
            </div>

            <ExcelImportModal
                isOpen={importLogic.showImportModal}
                onClose={() => importLogic.setShowImportModal(false)}
                headers={importLogic.importHeaders}
                previewRows={importLogic.importPreviewRows}
                columns={displayTable.columns.filter(c => !c.isPlaceholder)}
                fileName={importLogic.importFileName}
                onConfirm={importLogic.handleImportConfirm}
            />

            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
                            キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            confirmDialog.onConfirm();
                            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                        }}>
                            実行
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Context Menu for Email Cells */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white border border-[#DEE1E7] rounded-sm shadow-lg py-1 min-w-[160px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-[#EEF0F3] text-[#32353D]"
                        onClick={() => {
                            setContextMenu(null);
                            setShowSendEmailModal(true);
                        }}
                    >
                        <IconMail className="w-4 h-4 text-[#0000FF]" />
                        メール送信
                    </button>
                </div>
            )}

            {/* Send Email Modal */}
            {showSendEmailModal && currentOrganization && user && (
                <SendEmailModal
                    orgId={currentOrganization.id}
                    userId={user.id}
                    columns={table.columns.filter(c => !c.isPlaceholder).map(definitionToColumn)}
                    rows={table.rows.filter(r => !r.isPlaceholder)}
                    selectedRowIds={selectedRowIds}
                    selectedCellIds={selectedCellIds}
                    onClose={() => setShowSendEmailModal(false)}
                />
            )}
        </div>
    );
};
