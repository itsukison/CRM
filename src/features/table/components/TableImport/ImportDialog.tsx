import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { ColumnDefinition, ColumnType, Column, definitionToColumn } from '@/core/models';
import { CustomSelect } from '@/ui/primitives/custom-select';
import { IconX } from '@/components/Icons';

export interface ImportMapping {
    sourceHeader: string;
    action: 'existing' | 'new' | 'ignore';
    existingColumnId?: string;
    newColumnName?: string;
    newColumnType?: ColumnType;
}

export interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    headers: string[];
    previewRows: any[][];
    columns: ColumnDefinition[];
    fileName?: string;
    onConfirm: (mappings: ImportMapping[]) => void;
}

/**
 * Modal for importing Excel/CSV files with column mapping
 * Uses fuzzy matching to suggest existing columns to map to
 */
export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
    isOpen,
    onClose,
    headers,
    previewRows,
    columns,
    fileName,
    onConfirm,
}) => {
    const [mappings, setMappings] = useState<ImportMapping[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        const legacyColumns = columns.map(definitionToColumn);
        const fuse = new Fuse(legacyColumns, {
            keys: ['title'],
            threshold: 0.4,
        });

        const initialMappings = headers.map((header) => {
            const trimmed = header.trim();
            if (!trimmed) {
                return {
                    sourceHeader: header,
                    action: 'ignore' as const,
                };
            }

            const results = fuse.search(trimmed);
            if (results.length > 0 && typeof results[0].score === 'number' && results[0].score <= 0.3) {
                return {
                    sourceHeader: header,
                    action: 'existing' as const,
                    existingColumnId: results[0].item.id,
                };
            }

            return {
                sourceHeader: header,
                action: 'new' as const,
                newColumnName: header,
                newColumnType: 'text' as ColumnType,
            };
        });

        setMappings(initialMappings);
    }, [isOpen, headers, columns]);

    if (!isOpen) return null;

    const updateMapping = (index: number, patch: Partial<ImportMapping>) => {
        setMappings(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...patch };
            return next;
        });
    };

    const canConfirm = mappings.some(
        (m) => m.action === 'existing' || m.action === 'new'
    );

    const handleConfirmClick = () => {
        if (!canConfirm) {
            alert('少なくとも1つの列をマッピングしてください。');
            return;
        }
        onConfirm(mappings);
    };

    const legacyColumns = columns.map(definitionToColumn);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-[#f2f2f2]">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Excel / CSV インポート</span>
                        {fileName && (
                            <span className="text-xs text-gray-500 mt-1">{fileName}</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <IconX className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <p className="text-xs text-gray-600 mb-2">
                            アップロードしたファイルの列を、このテーブルの既存カラムにマッピングするか、新しいカラムとして追加します。
                        </p>
                        <div className="border border-gray-200 rounded-md overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                列マッピング
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                                {headers.map((header, index) => {
                                    const mapping = mappings[index] || {
                                        sourceHeader: header,
                                        action: 'ignore' as const,
                                    };

                                    return (
                                        <div key={`${header}-${index}`} className="flex items-start gap-3 px-3 py-2 bg-white">
                                            <div className="w-1/3">
                                                <div className="text-xs font-mono text-gray-500 mb-0.5">
                                                    列 {index + 1}
                                                </div>
                                                <div className="text-sm font-medium text-[#323232] break-words">
                                                    {header || <span className="text-gray-400 italic">（ヘッダーなし）</span>}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <CustomSelect
                                                    value={mapping.action}
                                                    onChange={(val) => {
                                                        const action = val as 'existing' | 'new' | 'ignore';
                                                        updateMapping(index, { action });
                                                    }}
                                                    options={[
                                                        { value: 'existing', label: '既存カラムにマップ' },
                                                        { value: 'new', label: '新しいカラムを作成' },
                                                        { value: 'ignore', label: 'マップしない' },
                                                    ]}
                                                />

                                                {mapping.action === 'existing' && (
                                                    <div className="mt-1">
                                                        <CustomSelect
                                                            value={mapping.existingColumnId || ''}
                                                            onChange={(val) => updateMapping(index, { existingColumnId: val })}
                                                            options={legacyColumns.map(col => ({
                                                                value: col.id,
                                                                label: col.title,
                                                            }))}
                                                        />
                                                    </div>
                                                )}

                                                {mapping.action === 'new' && (
                                                    <div className="mt-1 flex gap-2">
                                                        <input
                                                            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-white text-[#323232]"
                                                            placeholder="新しいカラム名"
                                                            value={mapping.newColumnName || ''}
                                                            onChange={(e) => updateMapping(index, { newColumnName: e.target.value })}
                                                        />
                                                        <CustomSelect
                                                            className="w-28"
                                                            value={mapping.newColumnType || 'text'}
                                                            onChange={(val) => updateMapping(index, { newColumnType: val as ColumnType })}
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
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                データプレビュー
                            </span>
                            <span className="text-[11px] text-gray-400">
                                先頭 {Math.min(previewRows.length, 5)} 行を表示
                            </span>
                        </div>
                        <div className="border border-gray-200 rounded-md overflow-auto max-h-48 bg-white">
                            {previewRows.length === 0 ? (
                                <div className="p-4 text-xs text-gray-400">
                                    プレビューできるデータがありません。
                                </div>
                            ) : (
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {headers.map((h, idx) => (
                                                <th key={idx} className="px-2 py-1 border-b border-r border-gray-200 text-left font-medium text-gray-600">
                                                    {h || `列${idx + 1}`}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewRows.slice(0, 5).map((row, rIdx) => (
                                            <tr key={rIdx} className="odd:bg-white even:bg-gray-50">
                                                {headers.map((_, cIdx) => (
                                                    <td key={cIdx} className="px-2 py-1 border-b border-r border-gray-100 text-gray-700">
                                                        {row[cIdx] != null ? String(row[cIdx]) : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-[11px] text-gray-500">
                        サポート形式: .xlsx, .csv / マップされていない列は無視されます
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-black border border-gray-200 rounded-md bg-white"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleConfirmClick}
                            disabled={!canConfirm}
                            className="px-4 py-1.5 text-xs font-bold text-white rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            インポートを実行
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
