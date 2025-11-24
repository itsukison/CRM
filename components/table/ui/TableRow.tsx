import React from 'react';
import { Row, Column, definitionToColumn } from '@/types';
import { TableCell } from './TableCell';
import { EnrichmentProgress } from '@/services/enrichmentService';

interface TableRowProps {
    row: Row;
    index: number;
    columns: Column[]; // Legacy columns
    allColumns: Column[]; // For formula evaluation
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
}

export const TableRow: React.FC<TableRowProps> = ({
    row,
    index,
    columns,
    allColumns,
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
    setEditingCell
}) => {
    const isGenerating = generatingRowIds.has(row.id);
    const isRowSelected = selectedRowIds.has(row.id);

    return (
        <tr
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
                        isSelected={isSelected}
                        isEditing={isEditing}
                        isLoading={isLoading}
                        enrichmentProgress={progress}
                        width={columnWidths[col.id] || 200}
                        handleCellClick={handleCellClick}
                        handleCellDoubleClick={handleCellDoubleClick}
                        handleCellUpdate={handleCellUpdate}
                        setEditingCell={setEditingCell}
                    />
                );
            })}
            <td className="border-b border-gray-100 bg-gray-50/10"></td>
            <td className="border-b border-gray-100 text-center"></td>
        </tr>
    );
};
