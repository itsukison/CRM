import React from 'react';
import { Row, Column } from '@/types';
import { TableCell } from './TableCell';
import { EnrichmentProgress } from '@/services/enrichmentService';
import { IconSparkles } from '@/components/Icons';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/src/ui/primitives/context-menu";

interface TableRowProps {
    row: Row;
    index: number;
    columns: Column[]; // Legacy columns
    allColumns: Column[]; // For formula evaluation
    allRows: Row[]; // For aggregate formulas
    selectedRowIds: Set<string>;
    toggleRowSelection: (id: string, shiftKey?: boolean) => void;
    generatingRowIds: Set<string>;
    loadingCells: Set<string>;
    selectedCellIds: Set<string>;
    editingCell: { rowId: string; colId: string } | null;
    enrichmentProgress: Map<string, EnrichmentProgress>;
    columnWidths: Record<string, number>;
    handleCellClick: (e: React.MouseEvent, rowId: string, colId: string) => void;
    handleCellDoubleClick: (rowId: string, colId: string) => void;
    handleCellUpdate: (rowId: string, colId: string, value: any) => void;
    setEditingCell: (cell: { rowId: string; colId: string } | null) => void;
    handleAddRowAbove: (rowId: string) => void;
    handleAddRowBelow: (rowId: string) => void;
    handleDeleteRow: (rowId?: string, skipConfirmation?: boolean) => void;
    onCellContextMenu?: (e: React.MouseEvent, rowId: string, colId: string, value: any) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
    row,
    index,
    columns,
    allColumns,
    allRows,
    selectedRowIds,
    toggleRowSelection,
    generatingRowIds,
    loadingCells,
    selectedCellIds,
    editingCell,
    enrichmentProgress,
    columnWidths,
    handleCellClick,
    handleCellDoubleClick,
    handleCellUpdate,
    setEditingCell,
    handleAddRowAbove,
    handleAddRowBelow,
    handleDeleteRow,
    onCellContextMenu
}) => {
    const isGenerating = generatingRowIds.has(row.id);
    const isRowSelected = selectedRowIds.has(row.id);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <tr className={`group ${isGenerating ? 'opacity-50' : ''} ${isRowSelected ? 'bg-[#F5F5F7]' : 'hover:bg-[#FAFAFA]'}`}>
                    <td className="w-10 p-0 border-b border-r border-[#E6E8EB] bg-white sticky left-0 z-20 text-center">
                        <div className="flex items-center justify-center h-full">
                            {isGenerating ? (
                                <IconSparkles className="w-3 h-3 text-[#0052FF] animate-pulse" />
                            ) : (
                                <>
                                    <span className={`text-[10px] font-mono text-[#5B616E] ${isRowSelected ? 'hidden' : 'block group-hover:hidden'}`}>
                                        {index + 1}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className={`accent-[#0052FF] w-3.5 h-3.5 cursor-pointer border-[#E6E8EB] rounded ${isRowSelected ? 'block' : 'hidden group-hover:block'}`}
                                        checked={isRowSelected}
                                        onChange={() => { }} // Handled by onClick
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleRowSelection(row.id, (e.nativeEvent as MouseEvent).shiftKey);
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </td>
                    {columns.map((col, colIndex) => {
                        const cellKey = `${row.id}-${col.id}`;
                        const isLoading = loadingCells.has(cellKey);
                        const cellId = `${row.id}:${col.id}`;
                        const isSelected = selectedCellIds.has(cellId);
                        const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                        const progress = enrichmentProgress.get(cellKey);

                        // Calculate selection borders
                        let selectionBorders = undefined;
                        if (isSelected) {
                            const prevRow = allRows[index - 1];
                            const nextRow = allRows[index + 1];
                            const prevCol = columns[colIndex - 1];
                            const nextCol = columns[colIndex + 1];

                            selectionBorders = {
                                top: !prevRow || !selectedCellIds.has(`${prevRow.id}:${col.id}`),
                                bottom: !nextRow || !selectedCellIds.has(`${nextRow.id}:${col.id}`),
                                left: !prevCol || !selectedCellIds.has(`${row.id}:${prevCol.id}`),
                                right: !nextCol || !selectedCellIds.has(`${row.id}:${nextCol.id}`)
                            };
                        }

                        return (
                            <TableCell
                                key={cellId}
                                row={row}
                                column={col}
                                allColumns={allColumns}
                                allRows={allRows}
                                isSelected={isSelected}
                                isEditing={isEditing}
                                isLoading={isLoading}
                                enrichmentProgress={progress}
                                width={columnWidths[col.id] || 200}
                                handleCellClick={handleCellClick}
                                handleCellDoubleClick={handleCellDoubleClick}
                                handleCellUpdate={handleCellUpdate}
                                setEditingCell={setEditingCell}
                                onContextMenu={onCellContextMenu}
                                selectionBorders={selectionBorders}
                            />
                        );
                    })}
                    <td className="border-b border-[#E6E8EB] bg-[#F5F5F7]/30"></td>
                    <td className="border-b border-[#E6E8EB] text-center"></td>
                </tr>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-white border border-[#E6E8EB] shadow-xl p-1 rounded-xl flex flex-col gap-0.5 min-w-[160px]">
                <ContextMenuItem
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left outline-none cursor-pointer"
                    onClick={() => handleAddRowAbove(row.id)}
                >
                    上に行を追加
                </ContextMenuItem>
                <ContextMenuItem
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left outline-none cursor-pointer"
                    onClick={() => handleAddRowBelow(row.id)}
                >
                    下に行を追加
                </ContextMenuItem>
                <div className="h-[1px] bg-[#E6E8EB] my-1 mx-1" />
                <ContextMenuItem
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#FF4D4D] hover:bg-[#FFF5F5] rounded-lg transition-colors w-full text-left outline-none cursor-pointer focus:text-[#FF4D4D] focus:bg-[#FFF5F5]"
                    onClick={() => {
                        // If multiple rows are selected and current row is one of them, delete all selected
                        // Otherwise delete just this row
                        if (selectedRowIds.has(row.id) && selectedRowIds.size > 0) {
                            handleDeleteRow(undefined, true); // undefined target -> delete selected, true -> skip confirm
                        } else {
                            handleDeleteRow(row.id, true); // delete specific row, skip confirm
                        }
                    }}
                >
                    行を削除
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
