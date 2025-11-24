import React from 'react';
import { Column, definitionToColumn, ColumnDefinition } from '@/core/models';
import { IconX, IconInfo } from '@/components/Icons';
import { isPlaceholderColumn } from '@/core/utils';

export interface EnrichmentPanelProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnDefinition[];
    targetColumnIds: Set<string>;
    onTargetColumnIdsChange: (ids: Set<string>) => void;
    selectedRowCount: number;
    onEnrich: () => void;
}

/**
 * Panel for configuring data enrichment on selected rows
 * Allows selecting which columns to enrich with AI
 */
export const EnrichmentPanel: React.FC<EnrichmentPanelProps> = ({
    isOpen,
    onClose,
    columns,
    targetColumnIds,
    onTargetColumnIdsChange,
    selectedRowCount,
    onEnrich,
}) => {
    if (!isOpen) return null;

    const handleColumnToggle = (colId: string) => {
        const next = new Set(targetColumnIds);
        if (next.has(colId)) {
            next.delete(colId);
        } else {
            next.add(colId);
        }
        onTargetColumnIdsChange(next);
    };

    const nonPlaceholderColumns = columns
        .map(definitionToColumn)
        .filter(col => !isPlaceholderColumn(col));

    return (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="p-3 border-b border-gray-100 bg-[#f2f2f2] flex justify-between items-center">
                <span className="text-xs font-bold text-[#323232] uppercase">更新するカラムを選択</span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <IconX className="w-3 h-3" />
                </button>
            </div>

            <div className="p-2 max-h-60 overflow-y-auto">
                {nonPlaceholderColumns.map(col => (
                    <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                            type="checkbox"
                            className="accent-purple-600 rounded border-gray-300"
                            checked={targetColumnIds.has(col.id)}
                            onChange={() => handleColumnToggle(col.id)}
                        />
                        <span className="text-sm text-[#323232]">{col.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono uppercase ml-auto">{col.type}</span>
                    </label>
                ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-[#f2f2f2] space-y-2">
                {targetColumnIds.size > 0 && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                        <IconInfo className="w-3.5 h-3.5" />
                        <span>選択された {selectedRowCount} 行 × {targetColumnIds.size} カラムの補完を実行します</span>
                    </div>
                )}
                <button
                    onClick={onEnrich}
                    disabled={targetColumnIds.size === 0}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded disabled:opacity-50"
                >
                    補完実行
                </button>
            </div>
        </div>
    );
};
