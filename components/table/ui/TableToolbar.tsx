import React, { useRef } from 'react';
import { TableData, SortState, Filter, TextOverflowMode, definitionToColumn } from '@/types';
import { CustomSelect } from './CustomSelect';
import { Checkbox } from '@/src/ui/primitives/checkbox';
import {
    IconSparkles, IconPlus, IconTrash, IconCheck, IconBolt, IconX, IconDatabase, IconSettings,
    IconFilter, IconSort, IconChevronRight, IconFileText, IconAlertTriangle, IconInfo, IconSearch,
    IconTextClip, IconTextWrap, IconTextVisible, IconDownload
} from '@/components/Icons';
import { EnrichmentProgress, GenerationProgress } from '@/services/enrichmentService';

interface TableToolbarProps {
    table: TableData;
    onUpdateTable: (updatedTable: TableData | ((prev: TableData) => TableData)) => void;
    selectedRowIds: Set<string>;
    selectedCellIds: Set<string>;

    // Sort
    showSortMenu: boolean;
    setShowSortMenu: (show: boolean) => void;
    activeSorts: SortState[];
    newSort: SortState;
    setNewSort: (sort: SortState) => void;
    addSort: (sort: SortState) => void;
    onUpdateSorts: (sorts: SortState[]) => void;

    // Filter
    showFilterMenu: boolean;
    setShowFilterMenu: (show: boolean) => void;
    activeFilters: Filter[];
    newFilter: Filter;
    setNewFilter: (filter: Filter) => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (index: number) => void;

    // AI Generation
    showGenPanel: boolean;
    setShowGenPanel: (show: boolean) => void;
    genPrompt: string;
    setGenPrompt: (prompt: string) => void;
    genCount: number;
    setGenCount: (count: number) => void;
    genSelectedColIds: Set<string>;
    setGenSelectedColIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    genNewColsString: string;
    setGenNewColsString: (s: string) => void;
    handleGenerateStart: () => void;
    generationProgress: GenerationProgress | null;

    // AI Enrichment
    showEnrichPanel: boolean;
    setShowEnrichPanel: (show: boolean) => void;
    enrichTargetCols: Set<string>;
    setEnrichTargetCols: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    handleEnrichmentStart: () => void;
    enrichmentProgress: Map<string, EnrichmentProgress>;

    // Import
    handleFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;

    // Actions
    handleAddEmptyRow: () => void;
    handleUnifiedDelete: () => void;

    // Add Menu
    showAddMenu: boolean;
    setShowAddMenu: (show: boolean) => void;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
    table,
    onUpdateTable,
    selectedRowIds,
    selectedCellIds,
    showSortMenu,
    setShowSortMenu,
    activeSorts,
    newSort,
    setNewSort,
    addSort,
    onUpdateSorts,
    showFilterMenu,
    setShowFilterMenu,
    activeFilters,
    newFilter,
    setNewFilter,
    addFilter,
    removeFilter,
    showGenPanel,
    setShowGenPanel,
    genPrompt,
    setGenPrompt,
    genCount,
    setGenCount,
    genSelectedColIds,
    setGenSelectedColIds,
    genNewColsString,
    setGenNewColsString,
    handleGenerateStart,
    generationProgress,
    showEnrichPanel,
    setShowEnrichPanel,
    enrichTargetCols,
    setEnrichTargetCols,
    handleEnrichmentStart,
    enrichmentProgress,
    handleFileSelected,
    handleAddEmptyRow,
    handleUnifiedDelete,
    showAddMenu,
    setShowAddMenu
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    const legacyColumns = table.columns.map(definitionToColumn);

    return (
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#323232]">All Companies</h1>
                <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {table.rows.length} 行 • {table.columns.length} 列
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                {/* Text Overflow Controls - Apply to selected column */}
                <div className="flex items-center bg-[#EEF0F3] p-0.5">
                    {(() => {
                        // Get the selected column from the first selected cell
                        const selectedColId = selectedCellIds.size > 0
                            ? Array.from(selectedCellIds)[0].split(':')[1]
                            : null;
                        const selectedColumn = selectedColId
                            ? table.columns.find(c => c.id === selectedColId)
                            : null;
                        const currentOverflow = selectedColumn?.textOverflow || 'clip';
                        const isDisabled = !selectedColId;

                        return (
                            <>
                                <button
                                    onClick={() => {
                                        if (!selectedColId) return;
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === selectedColId ? { ...c, textOverflow: 'clip' } : c
                                            )
                                        }));
                                    }}
                                    disabled={isDisabled}
                                    className={`p-1.5 transition-all ${currentOverflow === 'clip' && !isDisabled
                                            ? 'bg-white text-[#0A0B0D]'
                                            : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white'
                                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="クリップ"
                                >
                                    <IconTextClip className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!selectedColId) return;
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === selectedColId ? { ...c, textOverflow: 'ellipsis' } : c
                                            )
                                        }));
                                    }}
                                    disabled={isDisabled}
                                    className={`p-1.5 transition-all ${currentOverflow === 'ellipsis' && !isDisabled
                                            ? 'bg-white text-[#0A0B0D]'
                                            : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white'
                                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="省略記号"
                                >
                                    <IconTextVisible className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!selectedColId) return;
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === selectedColId ? { ...c, textOverflow: 'wrap' } : c
                                            )
                                        }));
                                    }}
                                    disabled={isDisabled}
                                    className={`p-1.5 transition-all ${currentOverflow === 'wrap' && !isDisabled
                                            ? 'bg-white text-[#0A0B0D]'
                                            : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white'
                                        } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="折り返し"
                                >
                                    <IconTextWrap className="w-3.5 h-3.5" />
                                </button>
                            </>
                        );
                    })()}
                </div>

                {/* Filter Menu */}
                <div className="relative" ref={filterMenuRef}>
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                            ${activeFilters.length > 0 ? 'bg-[#EEF0F3] border-[#B1B7C3] text-[#0A0B0D]' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}
                        `}
                    >
                        <IconFilter className="w-3.5 h-3.5" />
                        フィルター
                        {activeFilters.length > 0 && (
                            <span className="bg-[#0A0B0D] text-white text-[10px] px-1.5 min-w-[16px] h-4 flex items-center justify-center font-mono">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#0A0B0D] shadow-lg p-4 z-50">
                            <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-3 font-mono">アクティブフィルター</h3>
                            <div className="space-y-2 mb-4">
                                {activeFilters.map((filter, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-[#EEF0F3] p-2 border border-[#DEE1E7]">
                                        <span className="text-xs font-medium text-[#0A0B0D]">
                                            {legacyColumns.find(c => c.id === filter.columnId)?.title}
                                        </span>
                                        <span className="text-[10px] text-[#5B616E] bg-white px-1 border border-[#DEE1E7] font-mono">
                                            {filter.operator === 'contains' ? '含む' : filter.operator === 'equals' ? '等しい' : filter.operator === 'greater' ? '大きい' : '小さい'}
                                        </span>
                                        <span className="text-xs text-[#0A0B0D] flex-1 truncate font-mono">{filter.value}</span>
                                        <button onClick={() => removeFilter(idx)} className="text-[#B1B7C3] hover:text-[#FC401F]">
                                            <IconX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {activeFilters.length === 0 && (
                                    <div className="text-xs text-[#B1B7C3] text-center py-2 font-mono">フィルターなし</div>
                                )}
                            </div>

                            <div className="border-t border-[#DEE1E7] pt-3 space-y-2">
                                <CustomSelect
                                    value={newFilter.columnId}
                                    onChange={(val) => setNewFilter({ ...newFilter, columnId: val })}
                                    options={legacyColumns.map(c => ({ value: c.id, label: c.title }))}
                                />
                                <div className="flex gap-2">
                                    <CustomSelect
                                        className="w-1/3"
                                        value={newFilter.operator}
                                        onChange={(val) => setNewFilter({ ...newFilter, operator: val as any })}
                                        options={[
                                            { value: 'contains', label: '含む' },
                                            { value: 'equals', label: '等しい' },
                                            { value: 'greater', label: '大きい' },
                                            { value: 'less', label: '小さい' },
                                        ]}
                                    />
                                    <input
                                        className="flex-1 text-xs bg-[#EEF0F3] border border-[#DEE1E7] px-2 outline-none focus:ring-1 focus:ring-[#0000FF] focus:border-[#0000FF] placeholder:text-[#B1B7C3] font-mono"
                                        placeholder="値..."
                                        value={newFilter.value}
                                        onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (newFilter.columnId && newFilter.value) {
                                            addFilter(newFilter);
                                            setNewFilter({ columnId: '', operator: 'contains', value: '' });
                                        }
                                    }}
                                    disabled={!newFilter.columnId || !newFilter.value}
                                    className="w-full py-1.5 bg-[#0A0B0D] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                >
                                    フィルター追加
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort Menu */}
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                            ${activeSorts.length > 0 ? 'bg-[#EEF0F3] border-[#B1B7C3] text-[#0A0B0D]' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}
                        `}
                    >
                        <IconSort className="w-3.5 h-3.5" />
                        並び替え
                        {activeSorts.length > 0 && (
                            <span className="bg-[#0A0B0D] text-white text-[10px] px-1.5 min-w-[16px] h-4 flex items-center justify-center font-mono">
                                {activeSorts.length}
                            </span>
                        )}
                    </button>

                    {showSortMenu && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#0A0B0D] shadow-lg p-4 z-50">
                            <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-3 font-mono">並び替え</h3>
                            <div className="space-y-2 mb-4">
                                {activeSorts.map((sort, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-[#EEF0F3] p-2 border border-[#DEE1E7]">
                                        <span className="text-xs font-medium text-[#0A0B0D]">
                                            {legacyColumns.find(c => c.id === sort.columnId)?.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-[#5B616E] uppercase font-mono">{sort.direction === 'asc' ? '昇順' : '降順'}</span>
                                            <button
                                                onClick={() => onUpdateSorts(activeSorts.filter((_, i) => i !== idx))}
                                                className="text-[#B1B7C3] hover:text-[#FC401F]"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {activeSorts.length === 0 && (
                                    <div className="text-xs text-[#B1B7C3] text-center py-2 font-mono">並び替えなし</div>
                                )}
                            </div>

                            <div className="border-t border-[#DEE1E7] pt-3 space-y-2">
                                <CustomSelect
                                    value={newSort.columnId}
                                    onChange={(val) => setNewSort({ ...newSort, columnId: val })}
                                    options={legacyColumns.map(c => ({ value: c.id, label: c.title }))}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewSort({ ...newSort, direction: 'asc' })}
                                        className={`flex-1 py-1.5 text-xs font-medium border transition-colors font-mono ${newSort.direction === 'asc' ? 'bg-[#0A0B0D] border-[#0A0B0D] text-white' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}`}
                                    >
                                        昇順
                                    </button>
                                    <button
                                        onClick={() => setNewSort({ ...newSort, direction: 'desc' })}
                                        className={`flex-1 py-1.5 text-xs font-medium border transition-colors font-mono ${newSort.direction === 'desc' ? 'bg-[#0A0B0D] border-[#0A0B0D] text-white' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}`}
                                    >
                                        降順
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (newSort.columnId) {
                                            addSort(newSort);
                                            setNewSort({ columnId: '', direction: 'asc' });
                                        }
                                    }}
                                    disabled={!newSort.columnId}
                                    className="w-full py-1.5 bg-[#0A0B0D] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                                >
                                    並び替え追加
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enrichment Panel */}
                <div className="relative">
                    <button
                        onClick={() => setShowEnrichPanel(!showEnrichPanel)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                            ${showEnrichPanel ? 'bg-[#EEF0F3] border-[#B1B7C3] text-[#0A0B0D]' : 'bg-white border-[#DEE1E7] text-[#5B616E] hover:bg-[#EEF0F3]'}
                        `}
                    >
                        <IconBolt className="w-3.5 h-3.5" />
                        データ拡充
                    </button>

                    {showEnrichPanel && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#0A0B0D] shadow-lg p-4 z-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">データ拡充</h3>
                                <button onClick={() => setShowEnrichPanel(false)} className="text-[#B1B7C3] hover:text-[#5B616E]">
                                    <IconX className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-xs text-[#5B616E] mb-4 font-mono">
                                {selectedRowIds.size > 0 ? `選択された ${selectedRowIds.size} 行` : 'すべての行'}に対して拡充する列を選択してください。
                            </p>

                            <div className="max-h-48 overflow-y-auto mb-4 space-y-1 border border-[#DEE1E7] p-2">
                                {legacyColumns.map(col => (
                                    <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-[#EEF0F3] cursor-pointer">
                                        <Checkbox
                                            checked={enrichTargetCols.has(col.id)}
                                            onCheckedChange={() => setEnrichTargetCols(prev => {
                                                const next = new Set(prev);
                                                if (next.has(col.id)) next.delete(col.id);
                                                else next.add(col.id);
                                                return next;
                                            })}
                                            className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                        />
                                        <span className="text-xs text-[#0A0B0D]">{col.title}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleEnrichmentStart}
                                disabled={enrichTargetCols.size === 0 || selectedRowIds.size === 0}
                                className="w-full py-2 bg-[#0A0B0D] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
                            >
                                <IconBolt className="w-3.5 h-3.5" />
                                拡充を開始
                            </button>
                            {selectedRowIds.size === 0 && (
                                <p className="text-[10px] text-[#FC401F] mt-2 text-center font-mono">
                                    まず行を選択してください。
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Generation Panel */}
                {showGenPanel && (
                    <div className="absolute top-full right-10 mt-2 w-80 bg-white border border-[#0A0B0D] shadow-lg p-4 z-50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">AIデータ生成</h3>
                            <button onClick={() => setShowGenPanel(false)} className="text-[#B1B7C3] hover:text-[#5B616E]">
                                <IconX className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                    何を生成しますか？
                                </label>
                                <textarea
                                    className="w-full px-2 py-1.5 bg-[#EEF0F3] border border-[#DEE1E7] text-xs focus:ring-1 focus:ring-[#0000FF] focus:border-[#0000FF] outline-none placeholder:text-[#B1B7C3] font-mono resize-none"
                                    placeholder="例: 日本のSaaS企業..."
                                    value={genPrompt}
                                    onChange={(e) => setGenPrompt(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                        件数
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        className="w-full px-2 py-1.5 bg-[#EEF0F3] border border-[#DEE1E7] text-xs focus:ring-1 focus:ring-[#0000FF] focus:border-[#0000FF] outline-none font-mono"
                                        value={genCount}
                                        onChange={(e) => setGenCount(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                        既存列選択
                                    </label>
                                    <div className="text-xs bg-[#EEF0F3] border border-[#DEE1E7] px-2 py-1.5 text-[#5B616E] font-mono">
                                        {genSelectedColIds.size} 列
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                    既存列から選択
                                </label>
                                <div className="max-h-32 overflow-y-auto border border-[#DEE1E7] p-2 space-y-1">
                                    {legacyColumns.map(col => (
                                        <label key={col.id} className="flex items-center gap-2 p-1 hover:bg-[#EEF0F3] cursor-pointer">
                                            <Checkbox
                                                checked={genSelectedColIds.has(col.id)}
                                                onCheckedChange={() => setGenSelectedColIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(col.id)) next.delete(col.id);
                                                    else next.add(col.id);
                                                    return next;
                                                })}
                                                className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <span className="text-xs text-[#0A0B0D] font-mono">{col.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                    新規列（任意）
                                </label>
                                <input
                                    className="w-full px-2 py-1.5 bg-[#EEF0F3] border border-[#DEE1E7] text-xs focus:ring-1 focus:ring-[#0000FF] focus:border-[#0000FF] outline-none placeholder:text-[#B1B7C3] font-mono"
                                    placeholder="例: CEO名,設立年"
                                    value={genNewColsString}
                                    onChange={(e) => setGenNewColsString(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleGenerateStart}
                                disabled={!genPrompt}
                                className="w-full py-2 bg-[#0000FF] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
                            >
                                <IconSparkles className="w-3.5 h-3.5" />
                                生成開始
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Button (Import / AI) */}
                <div className="relative" ref={addMenuRef}>
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0B0D] text-white text-xs font-bold transition-opacity hover:opacity-90 font-mono"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        追加
                    </button>

                    {showAddMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#0A0B0D] shadow-lg py-1 z-50">
                            <button
                                onClick={handleAddEmptyRow}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#EEF0F3] flex items-center gap-2"
                            >
                                <IconPlus className="w-3.5 h-3.5 text-[#5B616E]" />
                                空の行
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    fileInputRef.current?.click();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#EEF0F3] flex items-center gap-2"
                            >
                                <IconDownload className="w-3.5 h-3.5 text-[#5B616E]" />
                                Excel / CSV をインポート
                            </button>
                            <div className="h-px bg-[#DEE1E7] my-1"></div>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    setShowGenPanel(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#EEF0F3] flex items-center gap-2"
                            >
                                <IconSparkles className="w-3.5 h-3.5 text-[#5B616E]" />
                                AIで生成
                            </button>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.csv"
                    onChange={handleFileSelected}
                />

                {(selectedRowIds.size > 0 || selectedCellIds.size > 0) && (
                    <button
                        onClick={handleUnifiedDelete}
                        className="p-1.5 text-[#FC401F] hover:bg-red-50 rounded transition-colors"
                        title="選択を削除"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                )}
            </div>

        </div>
    );
};
