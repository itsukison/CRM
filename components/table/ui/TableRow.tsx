import React from 'react';
import { Row, Column } from '@/types';
import { TableCell } from './TableCell';
import { EnrichmentProgress } from '@/services/enrichmentService';
import { IconSparkles } from '@/components/Icons';

interface TableRowProps {
    row: Row;
    index: number;
    columns: Column[]; // Legacy columns
    allColumns: Column[]; // For formula evaluation
    allRows: Row[]; // For aggregate formulas
    selectedRowIds: Set<string>;
    toggleRowSelection: (id: string) => void;
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
    onCellContextMenu
}) => {
    const isGenerating = generatingRowIds.has(row.id);
    const isRowSelected = selectedRowIds.has(row.id);

    return (
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
                                onChange={() => toggleRowSelection(row.id)}
                            />
                        </>
                    )}
                </div>
            </td>
            {columns.map(col => {
                const cellKey = `${row.id}-${col.id}`;
                const isLoading = loadingCells.has(cellKey);
                const cellId = `${row.id}:${col.id}`;
                const isSelected = selectedCellIds.has(cellId);
                const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                const progress = enrichmentProgress.get(cellKey);

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
                    />
                );
            })}
            <td className="border-b border-[#E6E8EB] bg-[#F5F5F7]/30"></td>
            <td className="border-b border-[#E6E8EB] text-center"></td>
        </tr>
    );
};
