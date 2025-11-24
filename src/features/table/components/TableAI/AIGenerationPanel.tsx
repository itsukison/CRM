import React from 'react';
import { Column, definitionToColumn, ColumnDefinition } from '@/core/models';
import { IconBolt, IconX } from '@/components/Icons';
import { isPlaceholderColumn } from '@/core/utils';

export interface AIGenerationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ColumnDefinition[];
    prompt: string;
    onPromptChange: (value: string) => void;
    count: number;
    onCountChange: (value: number) => void;
    selectedColumnIds: Set<string>;
    onSelectedColumnIdsChange: (ids: Set<string>) => void;
    newColumnsString: string;
    onNewColumnsStringChange: (value: string) => void;
    onGenerate: () => void;
}

/**
 * Panel for configuring AI data generation
 * Allows specifying prompt, row count, target columns, and new columns to create
 */
export const AIGenerationPanel: React.FC<AIGenerationPanelProps> = ({
    isOpen,
    onClose,
    columns,
    prompt,
    onPromptChange,
    count,
    onCountChange,
    selectedColumnIds,
    onSelectedColumnIdsChange,
    newColumnsString,
    onNewColumnsStringChange,
    onGenerate,
}) => {
    if (!isOpen) return null;

    const handleColumnToggle = (colId: string) => {
        const next = new Set(selectedColumnIds);
        if (next.has(colId)) {
            next.delete(colId);
        } else {
            next.add(colId);
        }
        onSelectedColumnIdsChange(next);
    };

    const nonPlaceholderColumns = columns
        .map(definitionToColumn)
        .filter(col => !isPlaceholderColumn(col));

    return (
        <div className="absolute right-0 top-16 mr-4 w-96 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#f2f2f2] shrink-0">
                <div className="flex items-center gap-2">
                    <IconBolt className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-[#323232] text-sm">AIデータ生成</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-black">
                    <IconX className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="p-4 space-y-5 overflow-y-auto">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        プロンプト
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        className="w-full border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md resize-none text-[#323232]"
                        rows={2}
                        placeholder="例: 東京のトップSaaS企業..."
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        生成数
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={count}
                        onChange={(e) => onCountChange(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-full border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-[#323232]"
                        placeholder="1-50"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        出力カラム
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-md p-1 bg-[#f2f2f2]">
                        {nonPlaceholderColumns.map(col => (
                            <label key={col.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="accent-blue-600 rounded border-gray-300"
                                    checked={selectedColumnIds.has(col.id)}
                                    onChange={() => handleColumnToggle(col.id)}
                                />
                                <span className="text-xs text-[#323232] truncate">{col.title}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        新しいカラムを追加 (カンマ、読点区切り)
                    </label>
                    <input
                        type="text"
                        value={newColumnsString}
                        onChange={(e) => onNewColumnsStringChange(e.target.value)}
                        className="w-full border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-[#323232]"
                        placeholder="例: 設立年, 従業員数、本社所在地"
                    />
                </div>

                <button
                    onClick={onGenerate}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700 transition-colors shadow-sm"
                >
                    生成を実行
                </button>
            </div>
        </div>
    );
};
