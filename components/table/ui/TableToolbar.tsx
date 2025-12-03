import React, { useRef } from 'react';
import { TableData, SortState, Filter, TextOverflowMode, definitionToColumn } from '@/types';
import { CustomSelect } from './CustomSelect';
import { Checkbox } from '@/src/ui/primitives/checkbox';
import {
    IconSparkles, IconPlus, IconTrash, IconCheck, IconBolt, IconX, IconDatabase, IconSettings,
    IconFilter, IconSort, IconChevronRight, IconFileText, IconAlertTriangle, IconInfo, IconSearch,
    IconTextClip, IconTextWrap, IconTextVisible, IconDownload, IconMail, IconDots
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
    onUpdateFilters: (filters: Filter[]) => void;

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

    // Email
    onSendEmailClick?: () => void;
    hasEmailColumn?: boolean;
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
    onUpdateFilters,
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
    setShowAddMenu,
    onSendEmailClick,
    hasEmailColumn
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    const legacyColumns = table.columns.map(definitionToColumn);

    return (
        <div className="h-16 border-b border-[#E6E8EB] bg-white flex items-center justify-between px-6 sticky top-0 z-[70]">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-[#0A0B0D] tracking-tight">{table.name}</h1>
                <span className="text-xs text-[#5B616E] font-mono bg-[#F5F5F7] px-2 py-1 rounded-md">
                    {table.rows.length} 行 • {table.columns.length} 列
                </span>
            </div>

            <div className="flex items-center gap-2">
                {/* Text Overflow Controls - Apply to selected column */}
                <div className="flex items-center bg-[#F5F5F7] p-1 rounded-xl">
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
                                    className={`p-1.5 rounded-lg transition-all ${currentOverflow === 'clip' && !isDisabled
                                        ? 'bg-white text-[#0A0B0D] shadow-sm'
                                        : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white/50'
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
                                    className={`p-1.5 rounded-lg transition-all ${currentOverflow === 'ellipsis' && !isDisabled
                                        ? 'bg-white text-[#0A0B0D] shadow-sm'
                                        : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white/50'
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
                                    className={`p-1.5 rounded-lg transition-all ${currentOverflow === 'wrap' && !isDisabled
                                        ? 'bg-white text-[#0A0B0D] shadow-sm'
                                        : 'text-[#5B616E] hover:text-[#0A0B0D] hover:bg-white/50'
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
                        className={`flex items-center gap-1 px-2 py-2 text-xs font-medium border rounded-xl transition-colors
                            ${activeFilters.length > 0 ? 'bg-[#F5F5F7] border-[#E6E8EB] text-[#0A0B0D]' : 'bg-white border-[#E6E8EB] text-[#5B616E] hover:bg-[#F5F5F7]'}
                        `}
                    >
                        <IconFilter className="w-3.5 h-3.5" />

                        {activeFilters.length > 0 && (
                            <span className="bg-[#0A0B0D] text-white text-[10px] px-1 min-w-[16px] h-4 flex items-center justify-center font-mono rounded-full">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <div className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-[#E6E8EB] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[#0A0B0D]">フィルター</h3>
                                <button onClick={() => setShowFilterMenu(false)} className="text-[#B1B7C3] hover:text-[#0A0B0D]">
                                    <IconX className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {activeFilters.map((filter, idx) => (
                                    <div key={idx} className="flex items-center gap-2">


                                        <CustomSelect
                                            value={filter.columnId}
                                            onChange={(val) => {
                                                const newFilters = [...activeFilters];
                                                newFilters[idx] = { ...filter, columnId: val };
                                                onUpdateFilters(newFilters);
                                            }}
                                            options={legacyColumns.map(c => ({ value: c.id, label: c.title }))}
                                            className="w-[130px] bg-[#F5F5F7] border-transparent focus:ring-[#595959]"
                                        />

                                        <CustomSelect
                                            value={filter.operator}
                                            onChange={(val) => {
                                                const newFilters = [...activeFilters];
                                                newFilters[idx] = { ...filter, operator: val as any };
                                                onUpdateFilters(newFilters);
                                            }}
                                            options={[
                                                { value: 'contains', label: '含む' },
                                                { value: 'equals', label: '等しい' },
                                                { value: 'greater', label: '大きい' },
                                                { value: 'less', label: '小さい' },
                                            ]}
                                            className="w-[90px] bg-[#F5F5F7] border-transparent focus:ring-[#595959]"
                                        />

                                        <input
                                            className="flex-1 min-w-0 text-xs bg-[#F5F5F7] border border-transparent rounded-xl px-2 py-2.5 outline-none focus:border-[#595959] focus:ring-1 focus:ring-[#595959] placeholder:text-[#B1B7C3]"
                                            placeholder="値..."
                                            value={filter.value}
                                            onChange={(e) => {
                                                const newFilters = [...activeFilters];
                                                newFilters[idx] = { ...filter, value: e.target.value };
                                                onUpdateFilters(newFilters);
                                            }}
                                        />

                                        <button
                                            onClick={() => removeFilter(idx)}
                                            className="text-[#B1B7C3] hover:text-[#FC401F] p-1"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        // Add a default filter
                                        const firstColId = legacyColumns[0]?.id || '';
                                        addFilter({ columnId: firstColId, operator: 'contains', value: '' });
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5B616E] hover:text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                                >
                                    <IconPlus className="w-3.5 h-3.5" />
                                    フィルターを追加
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort Menu */}
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className={`flex items-center gap-1 px-2 py-2 text-xs font-medium border rounded-xl transition-colors
                            ${activeSorts.length > 0 ? 'bg-[#F5F5F7] border-[#E6E8EB] text-[#0A0B0D]' : 'bg-white border-[#E6E8EB] text-[#5B616E] hover:bg-[#F5F5F7]'}
                        `}
                    >
                        <IconSort className="w-3.5 h-3.5" />
                        {activeSorts.length > 0 && (
                            <span className="bg-[#0A0B0D] text-white text-[10px] px-1 min-w-[16px] h-4 flex items-center justify-center font-mono rounded-full">
                                {activeSorts.length}
                            </span>
                        )}
                    </button>

                    {showSortMenu && (
                        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-[#E6E8EB] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[#0A0B0D]">並び替え</h3>
                                <button onClick={() => setShowSortMenu(false)} className="text-[#B1B7C3] hover:text-[#0A0B0D]">
                                    <IconX className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {activeSorts.map((sort, idx) => (
                                    <div key={idx} className="flex items-center gap-2">

                                        <CustomSelect
                                            value={sort.columnId}
                                            onChange={(val) => {
                                                const newSorts = [...activeSorts];
                                                newSorts[idx] = { ...sort, columnId: val };
                                                onUpdateSorts(newSorts);
                                            }}
                                            options={legacyColumns.map(c => ({ value: c.id, label: c.title }))}
                                            className="flex-1 bg-[#F5F5F7] border-transparent focus:ring-[#595959]"
                                        />

                                        <CustomSelect
                                            value={sort.direction}
                                            onChange={(val) => {
                                                const newSorts = [...activeSorts];
                                                newSorts[idx] = { ...sort, direction: val as 'asc' | 'desc' };
                                                onUpdateSorts(newSorts);
                                            }}
                                            options={[
                                                { value: 'asc', label: '昇順' },
                                                { value: 'desc', label: '降順' },
                                            ]}
                                            className="w-[80px] bg-[#F5F5F7] border-transparent focus:ring-[#595959]"
                                        />

                                        <button
                                            onClick={() => onUpdateSorts(activeSorts.filter((_, i) => i !== idx))}
                                            className="text-[#B1B7C3] hover:text-[#FC401F] p-1"
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        // Add a default sort
                                        const firstColId = legacyColumns[0]?.id || '';
                                        onUpdateSorts([...activeSorts, { columnId: firstColId, direction: 'asc' }]);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5B616E] hover:text-[#0A0B0D] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                                >
                                    <IconPlus className="w-3.5 h-3.5" />
                                    並び替えを追加
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Send Email Button - visible when rows/cells selected and email column exists */}
                {(selectedRowIds.size > 0 || selectedCellIds.size > 0) && hasEmailColumn && onSendEmailClick && (
                    <button
                        onClick={onSendEmailClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0052FF] text-white text-xs font-medium rounded-xl hover:bg-[#0040D0] transition-colors"
                        title="メール送信"
                    >
                        <IconMail className="w-3.5 h-3.5" />
                        メール
                    </button>
                )}

                {/* Enrichment Panel */}
                <div className="relative">
                    <button
                        onClick={() => setShowEnrichPanel(!showEnrichPanel)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-xl transition-colors
                            ${showEnrichPanel ? 'bg-[#F5F5F7] border-[#E6E8EB] text-[#0A0B0D]' : 'bg-white border-[#E6E8EB] text-[#5B616E] hover:bg-[#F5F5F7]'}
                        `}
                    >
                        <IconBolt className="w-3.5 h-3.5" />
                        データ拡充
                    </button>

                    {showEnrichPanel && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-[#E6E8EB] rounded-xl shadow-2xl p-4 z-50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">データ拡充</h3>
                                <button onClick={() => setShowEnrichPanel(false)} className="text-[#B1B7C3] hover:text-[#5B616E]">
                                    <IconX className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-xs text-[#5B616E] mb-4 font-mono">
                                {selectedRowIds.size > 0 ? `選択された ${selectedRowIds.size} 行` : 'すべての行'}に対して拡充する列を選択してください。
                            </p>

                            <div className="max-h-48 overflow-y-auto mb-4 space-y-1 border border-[#E6E8EB] rounded-lg p-2">
                                {legacyColumns.filter(col => col.title && col.title.trim() !== '').map(col => (
                                    <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-[#F5F5F7] rounded-md cursor-pointer">
                                        <Checkbox
                                            checked={enrichTargetCols.has(col.id)}
                                            onCheckedChange={() => setEnrichTargetCols(prev => {
                                                const next = new Set(prev);
                                                if (next.has(col.id)) next.delete(col.id);
                                                else next.add(col.id);
                                                return next;
                                            })}
                                            className="border-[#E6E8EB] data-[state=checked]:bg-[#0052FF] data-[state=checked]:border-[#0052FF]"
                                        />
                                        <span className="text-xs text-[#0A0B0D]">{col.title}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleEnrichmentStart}
                                disabled={enrichTargetCols.size === 0 || selectedRowIds.size === 0}
                                className="w-full py-2 bg-[#0A0B0D] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
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
                    <div className="absolute top-full right-10 mt-2 w-80 bg-white border border-[#E6E8EB] rounded-xl shadow-2xl p-4 z-50">
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
                                    className="w-full px-3 py-2 bg-[#F5F5F7] border-none rounded-lg text-xs focus:ring-2 focus:ring-[#808080] outline-none placeholder:text-[#B1B7C3] font-mono resize-none"
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
                                        className="w-full px-3 py-2 bg-[#F5F5F7] border-none rounded-xl text-xs focus:ring-2 focus:ring-[#808080] outline-none font-mono"
                                        value={genCount}
                                        onChange={(e) => setGenCount(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                        既存列選択
                                    </label>
                                    <div className="text-xs bg-[#F5F5F7] border border-[#E6E8EB] rounded-lg px-2 py-1.5 text-[#5B616E] font-mono">
                                        {genSelectedColIds.size} 列
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-[#5B616E] uppercase tracking-wider mb-1.5 font-mono">
                                    既存列から選択
                                </label>
                                <div className="max-h-32 overflow-y-auto border border-[#E6E8EB] rounded-lg p-2 space-y-1">
                                    {legacyColumns.filter(col => col.title && col.title.trim() !== '').map(col => (
                                        <label key={col.id} className="flex items-center gap-2 p-1 hover:bg-[#F5F5F7] rounded-md cursor-pointer">
                                            <Checkbox
                                                checked={genSelectedColIds.has(col.id)}
                                                onCheckedChange={() => setGenSelectedColIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(col.id)) next.delete(col.id);
                                                    else next.add(col.id);
                                                    return next;
                                                })}
                                                className="border-[#E6E8EB] data-[state=checked]:bg-[#0052FF] data-[state=checked]:border-[#0052FF]"
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
                                    className="w-full px-3 py-2 bg-[#F5F5F7] border-none rounded-xl text-xs focus:ring-2 focus:ring-[#808080] outline-none placeholder:text-[#B1B7C3] font-mono"
                                    placeholder="例: CEO名,設立年"
                                    value={genNewColsString}
                                    onChange={(e) => setGenNewColsString(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleGenerateStart}
                                disabled={!genPrompt}
                                className="w-full py-2 bg-[#0A0B0D] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono"
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
                        className="flex items-center gap-2 px-4 py-2 bg-[#0A0B0D] text-white text-xs font-bold rounded-xl transition-opacity hover:opacity-90 font-mono"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        追加
                    </button>

                    {showAddMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E6E8EB] rounded-xl shadow-2xl py-1 z-50">
                            <button
                                onClick={handleAddEmptyRow}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#F5F5F7] flex items-center gap-2"
                            >
                                <IconPlus className="w-3.5 h-3.5 text-[#5B616E]" />
                                空の行
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    fileInputRef.current?.click();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#F5F5F7] flex items-center gap-2"
                            >
                                <IconDownload className="w-3.5 h-3.5 text-[#5B616E]" />
                                Excel / CSV をインポート
                            </button>
                            <div className="h-px bg-[#E6E8EB] my-1"></div>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    setShowGenPanel(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#0A0B0D] hover:bg-[#F5F5F7] flex items-center gap-2"
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
            </div>

        </div>
    );
};
