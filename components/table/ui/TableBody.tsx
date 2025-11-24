import React from 'react';
import { TableData, definitionToColumn } from '@/types';
import { TableRow } from './TableRow';
import { IconPlus } from '@/components/Icons';
import { EnrichmentProgress } from '@/services/enrichmentService';

interface TableBodyProps {
    table: TableData;
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
    handleAddEmptyRow: () => void;
}

export const TableBody: React.FC<TableBodyProps> = ({
    table,
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
    handleAddEmptyRow
}) => {
    const legacyColumns = table.columns.map(definitionToColumn);

    return (
        <tbody>
            {table.rows.map((row, index) => (
                <TableRow
                    key={row.id}
                    row={row}
                    index={index}
                    columns={legacyColumns}
                    allColumns={legacyColumns}
                    selectedRowIds={selectedRowIds}
                    toggleRowSelection={toggleRowSelection}
                    generatingRowIds={generatingRowIds}
                    loadingCells={loadingCells}
                    selectedCellIds={selectedCellIds}
                    editingCell={editingCell}
                    enrichmentProgress={enrichmentProgress}
                    columnWidths={columnWidths}
                    handleCellClick={handleCellClick}
                    handleCellDoubleClick={handleCellDoubleClick}
                    handleCellUpdate={handleCellUpdate}
                    setEditingCell={setEditingCell}
                />
            ))}

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
    );
};
