import React from 'react';
import { Column, SortState, ColumnType } from '@/types';
import { IconSettings, IconSort, IconArrowUp, IconTrash, IconCheck, IconPlus, IconHash, IconCalendar, IconLink, IconTag, IconMail, IconFileText, IconEdit, IconArrowRight, IconArrowLeft } from '@/components/Icons';
import { CustomSelect } from './CustomSelect';
import { DescriptionModal } from './DescriptionModal';

interface TableColumnHeaderProps {
    column: Column;
    index: number;
    width: number;
    activeSorts: SortState[];
    onUpdateSorts: (sorts: SortState[]) => void;
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
    onUpdateSorts,
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
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = React.useState(false);
    const [showTypeMenu, setShowTypeMenu] = React.useState(false);
    const renameInputRef = React.useRef<HTMLInputElement>(null);

    const sortState = activeSorts.find(s => s.columnId === column.id);

    const getColumnIcon = (type: string) => {
        switch (type) {
            case 'text': return <IconFileText className="w-3 h-3 text-[#5B616E]" />;
            case 'number': return <IconHash className="w-3 h-3 text-[#5B616E]" />;
            case 'date': return <IconCalendar className="w-3 h-3 text-[#5B616E]" />;
            case 'url': return <IconLink className="w-3 h-3 text-[#5B616E]" />;
            case 'tag': return <IconTag className="w-3 h-3 text-[#5B616E]" />;
            case 'email': return <IconMail className="w-3 h-3 text-[#5B616E]" />;
            default: return <IconFileText className="w-3 h-3 text-[#5B616E]" />;
        }
    };

    const handleHeaderClick = () => {
        if (!isRenaming) {
            setEditingCol(column);
            setActiveColMenu(activeColMenu === column.id ? null : column.id);
        }
    };

    const startRenaming = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(true);
        setActiveColMenu(null);
        // Wait for render then focus
        setTimeout(() => renameInputRef.current?.focus(), 0);
    };

    const handleRenameSubmit = () => {
        if (renameInputRef.current && editingCol) {
            handleUpdateColumn({ ...editingCol, title: renameInputRef.current.value });
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setIsRenaming(false);
        }
    };

    return (
        <>
            <th
                className={`border-b border-r border-[#E6E8EB] bg-white relative group select-none sticky top-5 z-[60] cursor-pointer hover:bg-[#FAFAFA] transition-colors ${activeColMenu === column.id ? 'bg-[#F5F5F7]' : ''}`}
                style={{ width, minWidth: width, maxWidth: width }}
                onClick={handleHeaderClick}
            >
                <div className="flex items-center justify-between px-2 py-1.5 h-full">
                    <div className="flex items-center gap-2 overflow-hidden w-full">
                        <div className="flex items-center justify-center w-5 h-5 rounded bg-[#F5F5F7] shrink-0">
                            {getColumnIcon(column.type)}
                        </div>

                        {isRenaming ? (
                            <input
                                ref={renameInputRef}
                                className="w-full text-xs font-bold text-[#0A0B0D] bg-white border border-[#0052FF] rounded px-1 outline-none"
                                defaultValue={column.title}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={handleRenameSubmit}
                                onKeyDown={handleKeyDown}
                            />
                        ) : (
                            <span className="text-xs font-bold text-[#0A0B0D] truncate" title={column.title}>
                                {column.title}
                            </span>
                        )}
                    </div>

                    {sortState && (
                        <div className="text-blue-600 shrink-0 ml-1">
                            {sortState.direction === 'asc' ? <IconArrowUp className="w-3 h-3" /> : <IconArrowUp className="w-3 h-3 rotate-180" />}
                        </div>
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        handleColResizeStart(e, column.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Column Menu */}
                {activeColMenu === column.id && editingCol && (
                    <div
                        ref={colMenuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 mt-1 bg-white border border-[#E6E8EB] shadow-xl p-1 z-50 text-left font-normal animate-in fade-in zoom-in-95 duration-100 rounded-xl flex flex-col gap-0.5"
                        style={{ width: width }}
                    >
                        {/* Sort Options */}
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={() => {
                                onUpdateSorts([{ columnId: column.id, direction: 'asc' }]);
                                setActiveColMenu(null);
                            }}
                        >
                            <IconArrowUp className="w-3.5 h-3.5 text-[#5B616E]" />
                            昇順で並び替え
                        </button>
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={() => {
                                onUpdateSorts([{ columnId: column.id, direction: 'desc' }]);
                                setActiveColMenu(null);
                            }}
                        >
                            <IconArrowUp className="w-3.5 h-3.5 text-[#5B616E] rotate-180" />
                            降順で並び替え
                        </button>

                        <div className="h-[1px] bg-[#E6E8EB] my-1 mx-1" />

                        {/* Insert Options */}
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={() => handleAddColumnAt(index)}
                        >
                            <IconArrowLeft className="w-3.5 h-3.5 text-[#5B616E]" />
                            左に挿入
                        </button>
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={() => handleAddColumnAt(index + 1)}
                        >
                            <IconArrowRight className="w-3.5 h-3.5 text-[#5B616E]" />
                            右に挿入
                        </button>

                        <div className="h-[1px] bg-[#E6E8EB] my-1 mx-1" />

                        {/* Edit Options */}
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={startRenaming}
                        >
                            <IconEdit className="w-3.5 h-3.5 text-[#5B616E]" />
                            名前を変更
                        </button>

                        <div className="relative group/type" onMouseEnter={() => setShowTypeMenu(true)} onMouseLeave={() => setShowTypeMenu(false)}>
                            <button
                                className="flex items-center justify-between px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            >
                                <div className="flex items-center gap-2">
                                    {getColumnIcon(editingCol.type)}
                                    タイプ
                                </div>
                                <IconArrowRight className="w-3 h-3 text-[#5B616E]" />
                            </button>

                            {/* Type Sub-menu */}
                            {showTypeMenu && (
                                <div className="absolute left-full top-0 ml-1 w-40 bg-white border border-[#E6E8EB] shadow-xl p-1 rounded-xl flex flex-col gap-0.5">
                                    {[
                                        { value: 'text', label: 'テキスト' },
                                        { value: 'number', label: '数値' },
                                        { value: 'tag', label: 'タグ' },
                                        { value: 'url', label: 'URL' },
                                        { value: 'date', label: '日付' },
                                        { value: 'email', label: 'Eメール' }
                                    ].map((typeOption) => (
                                        <button
                                            key={typeOption.value}
                                            className={`flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left ${editingCol.type === typeOption.value ? 'bg-[#F5F5F7]' : ''}`}
                                            onClick={() => {
                                                handleUpdateColumn({ ...editingCol, type: typeOption.value as ColumnType });
                                                setShowTypeMenu(false);
                                            }}
                                        >
                                            {getColumnIcon(typeOption.value)}
                                            <span>{typeOption.label}</span>
                                            {editingCol.type === typeOption.value && <IconCheck className="w-3 h-3 ml-auto text-[#0052FF]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors w-full text-left"
                            onClick={() => {
                                setShowDescriptionModal(true);
                                setActiveColMenu(null);
                            }}
                        >
                            <IconFileText className="w-3.5 h-3.5 text-[#5B616E]" />
                            説明
                        </button>

                        <div className="h-[1px] bg-[#E6E8EB] my-1 mx-1" />

                        {/* Delete */}
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#FF4D4D] hover:bg-[#FFF5F5] rounded-lg transition-colors w-full text-left"
                            onClick={() => handleDeleteColumn(column.id)}
                        >
                            <IconTrash className="w-3.5 h-3.5" />
                            削除
                        </button>
                    </div>
                )}
            </th>

            <DescriptionModal
                isOpen={showDescriptionModal}
                onClose={() => setShowDescriptionModal(false)}
                onSave={(desc) => handleUpdateColumn({ ...column, description: desc })}
                initialDescription={column.description || ''}
                columnTitle={column.title}
            />
        </>
    );
};
