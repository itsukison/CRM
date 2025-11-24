import React, { useRef } from 'react';
import { TableData, SortState, Filter, TextOverflowMode, definitionToColumn } from '@/types';
import { CustomSelect } from './CustomSelect';
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
                {/* Text Overflow Controls - Context Aware */}
                {selectedCellIds.size > 0 && (() => {
                    const firstCellId = Array.from(selectedCellIds)[0];
                    const [, colId] = firstCellId.split(':');
                    const column = table.columns.find(c => c.id === colId);
                    const currentMode = column?.textOverflow || 'clip';

                    return (
                        <div className="flex items-center bg-gray-100 p-0.5 rounded-md">
                            <button
                                onClick={() => {
                                    if (column) {
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === colId ? { ...c, textOverflow: 'clip' } : c
                                            )
                                        }));
                                    }
                                }}
                                className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${currentMode === 'clip' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                title="クリップ"
                            >
                                <IconTextClip className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    if (column) {
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === colId ? { ...c, textOverflow: 'ellipsis' } : c
                                            )
                                        }));
                                    }
                                }}
                                className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${currentMode === 'ellipsis' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                title="省略記号"
                            >
                                <IconTextVisible className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => {
                                    if (column) {
                                        onUpdateTable(prev => ({
                                            ...prev,
                                            columns: prev.columns.map(c =>
                                                c.id === colId ? { ...c, textOverflow: 'wrap' } : c
                                            )
                                        }));
                                    }
                                }}
                                className={`p-1.5 rounded hover:bg-white hover:shadow-sm transition-all ${currentMode === 'wrap' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'
                                    }`}
                                title="折り返し"
                            >
                                <IconTextWrap className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })()}

                {/* Filter Menu */}
                <div className="relative" ref={filterMenuRef}>
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                            ${activeFilters.length > 0 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
                        `}
                    >
                        <IconFilter className="w-3.5 h-3.5" />
                        フィルター
                        {activeFilters.length > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                                {activeFilters.length}
                            </span>
                        )}
                    </button>

                    {showFilterMenu && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">アクティブフィルター</h3>
                            <div className="space-y-2 mb-4">
                                {activeFilters.map((filter, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="text-xs font-medium text-gray-700">
                                            {legacyColumns.find(c => c.id === filter.columnId)?.title}
                                        </span>
                                        <span className="text-[10px] text-gray-400 bg-white px-1 rounded border border-gray-200">
                                            {filter.operator === 'contains' ? '含む' : filter.operator === 'equals' ? '等しい' : filter.operator === 'greater' ? '大きい' : '小さい'}
                                        </span>
                                        <span className="text-xs text-black flex-1 truncate">{filter.value}</span>
                                        <button onClick={() => removeFilter(idx)} className="text-gray-400 hover:text-red-500">
                                            <IconX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {activeFilters.length === 0 && (
                                    <div className="text-xs text-gray-400 italic text-center py-2">フィルターなし</div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-3 space-y-2">
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
                                        className="flex-1 text-xs border border-gray-200 rounded px-2 outline-none focus:ring-1 focus:ring-blue-500"
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
                                    className="w-full py-1.5 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                            ${activeSorts.length > 0 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
                        `}
                    >
                        <IconSort className="w-3.5 h-3.5" />
                        並び替え
                        {activeSorts.length > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                                {activeSorts.length}
                            </span>
                        )}
                    </button>

                    {showSortMenu && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">並び替え</h3>
                            <div className="space-y-2 mb-4">
                                {activeSorts.map((sort, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="text-xs font-medium text-gray-700">
                                            {legacyColumns.find(c => c.id === sort.columnId)?.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 uppercase">{sort.direction === 'asc' ? '昇順' : '降順'}</span>
                                            <button
                                                onClick={() => onUpdateSorts(activeSorts.filter((_, i) => i !== idx))}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-3 space-y-2">
                                <CustomSelect
                                    value={newSort.columnId}
                                    onChange={(val) => setNewSort({ ...newSort, columnId: val })}
                                    options={legacyColumns.map(c => ({ value: c.id, label: c.title }))}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewSort({ ...newSort, direction: 'asc' })}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border ${newSort.direction === 'asc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                                    >
                                        昇順
                                    </button>
                                    <button
                                        onClick={() => setNewSort({ ...newSort, direction: 'desc' })}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border ${newSort.direction === 'desc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
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
                                    className="w-full py-1.5 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                            ${showEnrichPanel ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}
                        `}
                    >
                        <IconBolt className="w-3.5 h-3.5" />
                        データ拡充
                    </button>

                    {showEnrichPanel && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">データ拡充</h3>
                                <button onClick={() => setShowEnrichPanel(false)} className="text-gray-400 hover:text-gray-600">
                                    <IconX className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 mb-4">
                                {selectedRowIds.size > 0 ? `選択された ${selectedRowIds.size} 行` : 'すべての行'}に対して拡充する列を選択してください。
                            </p>

                            <div className="max-h-48 overflow-y-auto mb-4 space-y-1 border border-gray-100 rounded p-2">
                                {legacyColumns.map(col => (
                                    <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enrichTargetCols.has(col.id)}
                                            onChange={() => setEnrichTargetCols(prev => {
                                                const next = new Set(prev);
                                                if (next.has(col.id)) next.delete(col.id);
                                                else next.add(col.id);
                                                return next;
                                            })}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-xs text-gray-700">{col.title}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handleEnrichmentStart}
                                disabled={enrichTargetCols.size === 0 || selectedRowIds.size === 0}
                                className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <IconBolt className="w-3.5 h-3.5" />
                                拡充を開始
                            </button>
                            {selectedRowIds.size === 0 && (
                                <p className="text-[10px] text-red-500 mt-2 text-center">
                                    まず行を選択してください。
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Button (Import / AI) */}
                <div className="relative" ref={addMenuRef}>
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        追加
                    </button>

                    {showAddMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <button
                                onClick={handleAddEmptyRow}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <IconPlus className="w-3.5 h-3.5 text-gray-400" />
                                空の行
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    fileInputRef.current?.click();
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <IconDownload className="w-3.5 h-3.5 text-gray-400" />
                                Excel / CSV をインポート
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                                onClick={() => {
                                    setShowAddMenu(false);
                                    setShowGenPanel(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                            >
                                <IconSparkles className="w-3.5 h-3.5 text-blue-500" />
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
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="選択を削除"
                    >
                        <IconTrash className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Generation Panel (Dialog) */}
            {showGenPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <IconSparkles className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-800">AIデータ生成</h3>
                            </div>
                            <button onClick={() => setShowGenPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    何を生成しますか？
                                </label>
                                <input
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                    placeholder="例: 日本のSaaS企業、東京のAIスタートアップ..."
                                    value={genPrompt}
                                    onChange={(e) => setGenPrompt(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        件数
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                        value={genCount}
                                        onChange={(e) => setGenCount(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        対象カラム
                                    </label>
                                    <div className="relative group">
                                        <button className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-left text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-between">
                                            <span>{genSelectedColIds.size} 列選択済み</span>
                                            <IconChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
                                        </button>
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto hidden group-hover:block z-10">
                                            {legacyColumns.map(col => (
                                                <label key={col.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={genSelectedColIds.has(col.id)}
                                                        onChange={() => setGenSelectedColIds(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(col.id)) next.delete(col.id);
                                                            else next.add(col.id);
                                                            return next;
                                                        })}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-700">{col.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    新規カラム追加（任意）
                                </label>
                                <input
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
                                    placeholder="例: CEO名、設立年（カンマ区切り）"
                                    value={genNewColsString}
                                    onChange={(e) => setGenNewColsString(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowGenPanel(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleGenerateStart}
                                disabled={!genPrompt}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <IconSparkles className="w-4 h-4" />
                                生成
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
