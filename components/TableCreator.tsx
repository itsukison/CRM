// TableCreator component - simplified version without AI data generation
import React, { useState } from 'react';
import { Column, TableData, columnToDefinition, Row, COMPANY_COLUMN_ID } from '@/types';
import { IconPlus, IconTrash } from './Icons';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/primitives/select';
import { toast } from 'sonner';

interface TableCreatorProps {
    onTableCreated: (table: TableData) => void;
    onCancel: () => void;
    orgId?: string;
}

export const TableCreator: React.FC<TableCreatorProps> = ({ onTableCreated, onCancel, orgId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [columns, setColumns] = useState<Column[]>([
        { id: COMPANY_COLUMN_ID, title: '会社名', type: 'text' },
        { id: 'col_2', title: '業界', type: 'tag' },
        { id: 'col_3', title: '担当者名', type: 'text' },
        { id: 'col_4', title: 'メール', type: 'email' },
    ]);

    const addColumn = () => {
        const newId = `col_${columns.length + 1}`;
        setColumns([...columns, { id: newId, title: '', type: 'text' }]);
    };

    const removeColumn = (index: number) => {
        if (columns.length <= 1) {
            toast.error('少なくとも1つのカラムが必要です');
            return;
        }
        const newCols = [...columns];
        newCols.splice(index, 1);
        setColumns(newCols);
    };

    const updateColumn = (index: number, field: keyof Column, value: string) => {
        const newCols = [...columns];
        newCols[index] = { ...newCols[index], [field]: value };
        setColumns(newCols);
    };

    const createTableWithPlaceholders = () => {
        try {
            // Convert Column to ColumnDefinition
            const columnDefinitions = columns.map((col, idx) => ({
                ...columnToDefinition(col, idx),
                textOverflow: 'clip' as const // Set default to clip
            }));

            const MIN_COLUMNS = 10;

            // Pad to minimum 10 columns (A~J)
            let finalColumns = [...columnDefinitions];
            if (finalColumns.length < MIN_COLUMNS) {
                const needed = MIN_COLUMNS - finalColumns.length;
                const getColumnLetter = (colIndex: number) => {
                    let letter = '';
                    while (colIndex >= 0) {
                        letter = String.fromCharCode((colIndex % 26) + 65) + letter;
                        colIndex = Math.floor(colIndex / 26) - 1;
                    }
                    return letter;
                };

                for (let i = 0; i < needed; i++) {
                    const colIndex = finalColumns.length + i;
                    const colLetter = getColumnLetter(colIndex);
                    finalColumns.push({
                        id: `col_placeholder_${Date.now()}_${i}`,
                        name: `Column ${colLetter}`,
                        type: 'text',
                        description: '',
                        required: false,
                        order: colIndex,
                        textOverflow: 'clip' as const
                    });
                }
            }

            // Generate 50 placeholder rows (empty values) with required 'id'
            const placeholderRows: Row[] = Array.from({ length: 50 }, (_, i) => {
                const row: Row = { id: `row_${Date.now()}_${i}` };
                finalColumns.forEach(col => {
                    (row as any)[col.id] = null; // empty placeholder
                });
                return row;
            });
            const newTable: TableData = {
                id: `table_${Date.now()}`,
                org_id: orgId || 'default',
                name,
                description,
                columns: finalColumns,
                rows: placeholderRows,
            };
            onTableCreated(newTable);
        } catch (e) {
            console.error(e);
            toast.error('テーブルの作成に失敗しました');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">データベース作成</h2>
                <p className="text-gray-500 font-mono text-sm">スキーマを定義してテーブルを作成</p>
            </div>
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">データベース名</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="text-lg font-medium"
                            placeholder="例: 新規リード顧客"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">コンテキスト / 説明</Label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            rows={2}
                            placeholder="どのようなデータを扱いますか？"
                        />
                    </div>
                    <div>
                        <Label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">スキーマ定義</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {columns.map((col, idx) => (
                                <div key={col.id} className="flex gap-3 items-center p-4 bg-gray-50 border border-gray-200 group hover:border-gray-400 transition-all relative" style={{ borderRadius: '4px' }}>
                                    <button
                                        onClick={() => removeColumn(idx)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="削除"
                                    >
                                        <IconTrash className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            value={col.title}
                                            onChange={e => updateColumn(idx, 'title', e.target.value)}
                                            className="border-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-600 font-bold placeholder:font-normal"
                                            placeholder="カラム名"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Select
                                            value={col.type}
                                            onValueChange={value => updateColumn(idx, 'type', value as any)}
                                        >
                                            <SelectTrigger className="h-9 text-xs font-mono">
                                                <SelectValue placeholder="型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">テキスト</SelectItem>
                                                <SelectItem value="number">数値</SelectItem>
                                                <SelectItem value="tag">タグ</SelectItem>
                                                <SelectItem value="url">URL</SelectItem>
                                                <SelectItem value="date">日付</SelectItem>
                                                <SelectItem value="email">Eメール</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={addColumn}
                            className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 uppercase tracking-wider"
                        >
                            <IconPlus className="w-3 h-3 mr-2" /> カラム追加
                        </Button>
                    </div>
                    <div className="pt-8 flex gap-4 border-t border-gray-100">
                        <Button
                            onClick={createTableWithPlaceholders}
                            disabled={!name}
                            className="bg-black text-white hover:bg-gray-800 shadow-lg"
                            size="lg"
                        >
                            作成
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            size="lg"
                            className="text-gray-500 hover:text-black"
                        >
                            キャンセル
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
