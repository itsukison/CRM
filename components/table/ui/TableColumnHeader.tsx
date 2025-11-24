import React from 'react';
import { Column, SortState, ColumnType } from '@/types';
import { IconSettings, IconSort, IconArrowUp, IconTrash, IconCheck } from '@/components/Icons';
import { CustomSelect } from './CustomSelect';

interface TableColumnHeaderProps {
    column: Column;
    width: number;
    activeSorts: SortState[];
    activeColMenu: string | null;
    setActiveColMenu: (id: string | null) => void;
    editingCol: Column | null;
    setEditingCol: (col: Column | null) => void;
    handleUpdateColumn: (col: Column) => void;
    handleDeleteColumn: (id: string) => void;
    handleColResizeStart: (e: React.MouseEvent, colId: string) => void;
    colMenuRef: React.RefObject<HTMLDivElement>;
}

export const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({
    column,
    width,
    activeSorts,
    activeColMenu,
    setActiveColMenu,
    editingCol,
    setEditingCol,
    handleUpdateColumn,
    handleDeleteColumn,
    handleColResizeStart,
    colMenuRef
}) => {
    const sortState = activeSorts.find(s => s.columnId === column.id);

    return (
        <th
            className="border-b border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm relative group select-none"
            style={{ width, minWidth: width, maxWidth: width }}
        >
            <div className="flex items-center justify-between px-3 py-2 h-full">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        {column.type}
                    </span>
                    <span className="text-xs font-bold text-gray-700 truncate" title={column.title}>
                        {column.title}
                    </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sortState && (
                        <div className="opacity-100 text-blue-600">
                            {sortState.direction === 'asc' ? <IconArrowUp className="w-3 h-3" /> : <IconArrowUp className="w-3 h-3 rotate-180" />}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setEditingCol(column);
                            setActiveColMenu(activeColMenu === column.id ? null : column.id);
                        }}
                        className={`p-1 hover:bg-gray-200 rounded ${activeColMenu === column.id ? 'bg-gray-200 text-black' : 'text-gray-400'}`}
                    >
                        <IconSettings className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
                onMouseDown={(e) => handleColResizeStart(e, column.id)}
            />

            {/* Column Menu */}
            {activeColMenu === column.id && editingCol && (
                <div
                    ref={colMenuRef}
                    className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 text-left font-normal animate-in fade-in zoom-in-95 duration-100"
                >
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">カラム編集</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">名前</label>
                            <input
                                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                value={editingCol.title}
                                onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">タイプ</label>
                            <CustomSelect
                                value={editingCol.type}
                                onChange={(val) => setEditingCol({ ...editingCol, type: val as ColumnType })}
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
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">説明</label>
                            <input
                                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                                value={editingCol.description || ''}
                                onChange={(e) => setEditingCol({ ...editingCol, description: e.target.value })}
                                placeholder="任意の説明"
                            />
                        </div>
                        <div className="pt-2 flex items-center justify-between gap-2">
                            <button
                                onClick={() => handleDeleteColumn(column.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="カラムを削除"
                            >
                                <IconTrash className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleUpdateColumn(editingCol)}
                                className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                            >
                                <IconCheck className="w-3.5 h-3.5" />
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </th>
    );
};
