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
    toggleAllRows: () => void;
    isAllSelected: boolean;
    colMenuRef: React.RefObject<HTMLDivElement>;
}

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
    toggleAllRows,
    isAllSelected,
    colMenuRef
}) => {
    return (
        <thead className="sticky top-0 z-20 shadow-sm">
            <tr>
                <th className="w-10 p-0 border-b border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky left-0 z-30">
                    <div className="w-full h-full flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="accent-blue-600 w-3.5 h-3.5 cursor-pointer border-gray-300 rounded"
                            checked={isAllSelected}
                            onChange={toggleAllRows}
                        />
                    </div>
                </th>
                {table.columns.map(colDef => {
                    const col = definitionToColumn(colDef);
                    return (
                        <TableColumnHeader
                            key={col.id}
                            column={col}
                            width={columnWidths[col.id] || 200}
                            activeSorts={activeSorts}
                            activeColMenu={activeColMenu}
                            setActiveColMenu={setActiveColMenu}
                            editingCol={editingCol}
                            setEditingCol={setEditingCol}
                            handleUpdateColumn={handleUpdateColumn}
                            handleDeleteColumn={handleDeleteColumn}
                            handleColResizeStart={handleColResizeStart}
                            colMenuRef={colMenuRef}
                        />
                    );
                })}
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
    );
};
