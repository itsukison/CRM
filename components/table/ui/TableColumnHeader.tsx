import React from 'react';
import { Column, SortState, ColumnType } from '@/types';
import { IconSettings, IconSort, IconArrowUp, IconTrash, IconCheck, IconPlus } from '@/components/Icons';
import { CustomSelect } from './CustomSelect';

interface TableColumnHeaderProps {
    column: Column;
    index: number;
    width: number;
    activeSorts: SortState[];
    activeColMenu: string | null;
    setActiveColMenu: (id: string | null) => void;
    editingCol: Column | null;
    setEditingCol: (col: Column | null) => void;
    handleUpdateColumn: (col: Column) => void;
    handleDeleteColumn: (id: string) => void;
    handleColResizeStart: (e: React.MouseEvent, colId: string) => void;
    handleAddColumnAt: (index: number) => void;
    colMenuRef: React.RefObject<HTMLDivElement>;
}

export const TableColumnHeader: React.FC<TableColumnHeaderProps> = ({
    column,
    index,
    width,
    activeSorts,
    activeColMenu,
    setActiveColMenu,
    editingCol,
    setEditingCol,
    handleUpdateColumn,
    handleDeleteColumn,
    handleColResizeStart,
    handleAddColumnAt,
    colMenuRef
}) => {
    const sortState = activeSorts.find(s => s.columnId === column.id);

    return (
        <th
            className="border-b border-r border-[#E6E8EB] bg-white relative group select-none sticky top-6 z-40"
            style={{ width, minWidth: width, maxWidth: width }}
        >
            <div className="flex items-center justify-between px-3 py-2 h-full">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-mono text-[#5B616E] uppercase tracking-wider bg-gray-100 px-1 rounded border border-gray-200">
                        {column.type}
                    </span>
                    <span className="text-xs font-bold text-[#0A0B0D] truncate" title={column.title}>
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
                        className={`p-1 hover:bg-[#EEF0F3] rounded ${activeColMenu === column.id ? 'bg-[#EEF0F3] text-[#0A0B0D]' : 'text-[#5B616E]'}`}
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
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#E6E8EB] shadow-xl p-4 z-50 text-left font-normal animate-in fade-in zoom-in-95 duration-100 rounded-2xl"
                >
                    <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-3 font-mono">カラム編集</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-[#5B616E] uppercase mb-1">名前</label>
                            <input
                                className="w-full px-2 py-1.5 text-xs border border-[#DEE1E7] rounded focus:ring-1 focus:ring-blue-500 outline-none text-[#0A0B0D]"
                                value={editingCol.title}
                                onChange={(e) => setEditingCol({ ...editingCol, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#5B616E] uppercase mb-1">タイプ</label>
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
                            <label className="block text-[10px] font-bold text-[#5B616E] uppercase mb-1">説明</label>
                            <input
                                className="w-full px-2 py-1.5 text-xs border border-[#DEE1E7] rounded focus:ring-1 focus:ring-blue-500 outline-none text-[#0A0B0D]"
                                value={editingCol.description || ''}
                                onChange={(e) => setEditingCol({ ...editingCol, description: e.target.value })}
                                placeholder="任意の説明"
                            />
                        </div>

                        {/* Insert Columns */}
                        <div className="pt-2 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => handleAddColumnAt(index)}
                                className="flex-1 py-1.5 px-2 text-[10px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 flex items-center justify-center gap-1"
                            >
                                <IconPlus className="w-3 h-3" />
                                左に挿入
                            </button>
                            <button
                                onClick={() => handleAddColumnAt(index + 1)}
                                className="flex-1 py-1.5 px-2 text-[10px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200 flex items-center justify-center gap-1"
                            >
                                <IconPlus className="w-3 h-3" />
                                右に挿入
                            </button>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100 mt-2">
                            <button
                                onClick={() => handleDeleteColumn(column.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="カラムを削除"
                            >
                                <IconTrash className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleUpdateColumn(editingCol)}
                                className="flex-1 py-1.5 bg-[#0A0B0D]/50 text-white text-xs font-bold rounded hover:bg-[#0A0B0D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
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
