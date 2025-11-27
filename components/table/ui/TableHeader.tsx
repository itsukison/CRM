import React from 'react';
import { TableData, SortState, Column, definitionToColumn } from '@/types';
import { TableColumnHeader } from './TableColumnHeader';
import { IconPlus } from '@/components/Icons';

interface TableHeaderProps {
    table: TableData;
    columnWidths: Record<string, number>;
    activeSorts: SortState[];
    activeColMenu: string | null;
    setActiveColMenu: (id: string | null) => void;
    editingCol: Column | null;
    setEditingCol: (col: Column | null) => void;
    handleUpdateColumn: (col: Column) => void;
    handleDeleteColumn: (id: string) => void;
    handleColResizeStart: (e: React.MouseEvent, colId: string) => void;
    handleAddColumn: () => void;
    handleAddColumnAt: (index: number) => void;
    toggleAllRows: () => void;
    isAllSelected: boolean;
    colMenuRef: React.RefObject<HTMLDivElement>;
}

// Helper function to convert column index to spreadsheet letter (A-Z, AA-ZZ, etc.)
const getColumnLetter = (index: number): string => {
    let letter = '';
    let num = index;

    while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
    }

    return letter;
};

export const TableHeader: React.FC<TableHeaderProps> = ({
    table,
    columnWidths,
    activeSorts,
    activeColMenu,
    setActiveColMenu,
    editingCol,
    setEditingCol,
    handleUpdateColumn,
    handleDeleteColumn,
    handleColResizeStart,
    handleAddColumn,
    handleAddColumnAt,
    toggleAllRows,
    isAllSelected,
    colMenuRef
}) => {
    return (
        <thead className="shadow-sm bg-white">
            {/* Spreadsheet Column Letters Row */}
            <tr className="h-6">
                <th className="w-10 p-0 border-b border-r border-[#E6E8EB] bg-[#F5F5F7] sticky top-0 left-0 z-50">
                </th>
                {table.columns.map((colDef, index) => (
                    <th
                        key={`letter-${colDef.id}`}
                        className="border-b border-r border-[#E6E8EB] bg-[#F5F5F7] text-center align-middle sticky top-0 z-40"
                        style={{ width: columnWidths[colDef.id] || 200, minWidth: columnWidths[colDef.id] || 200, maxWidth: columnWidths[colDef.id] || 200 }}
                    >
                        <span className="text-[10px] font-mono font-bold text-[#5B616E]">
                            {getColumnLetter(index)}
                        </span>
                    </th>
                ))}
                <th className="w-24 p-0 border-b border-[#E6E8EB] bg-[#F5F5F7] sticky top-0 z-40"></th>
                <th className="border-b border-[#E6E8EB] bg-[#F5F5F7] sticky top-0 z-40"></th>
            </tr>

            {/* Column Headers Row */}
            <tr>
                <th className="w-10 p-0 border-b border-r border-[#E6E8EB] bg-white sticky top-6 left-0 z-50">
                    <div className="w-full h-full flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="accent-[#0052FF] w-3.5 h-3.5 cursor-pointer border-[#E6E8EB] rounded"
                            checked={isAllSelected}
                            onChange={toggleAllRows}
                        />
                    </div>
                </th>
                {table.columns.map((colDef, index) => {
                    const col = definitionToColumn(colDef);
                    return (
                        <TableColumnHeader
                            key={col.id}
                            column={col}
                            index={index}
                            width={columnWidths[col.id] || 200}
                            activeSorts={activeSorts}
                            activeColMenu={activeColMenu}
                            setActiveColMenu={setActiveColMenu}
                            editingCol={editingCol}
                            setEditingCol={setEditingCol}
                            handleUpdateColumn={handleUpdateColumn}
                            handleDeleteColumn={handleDeleteColumn}
                            handleColResizeStart={handleColResizeStart}
                            handleAddColumnAt={handleAddColumnAt}
                            colMenuRef={colMenuRef}
                        />
                    );
                })}
                <th className="w-24 p-0 border-b border-[#E6E8EB] bg-white align-middle sticky top-6 z-40">
                    <button
                        onClick={handleAddColumn}
                        className="w-full h-full flex items-center justify-center gap-1 text-[#5B616E] hover:text-[#0052FF] hover:bg-[#F5F5F7] transition-colors"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase font-mono">New</span>
                    </button>
                </th>
                <th className="border-b border-[#E6E8EB] bg-white sticky top-6 z-40"></th>
            </tr>
        </thead>
    );
};
