// TableCreator component - simplified version without AI data generation
import React, { useState } from 'react';
import { Column, TableData, columnToDefinition, Row, COMPANY_COLUMN_ID } from '@/types';
import { IconPlus, IconTrash, IconSparkles, IconTable } from './Icons';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/primitives/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/primitives/dialog';
import { toast } from 'sonner';
import { generateCompaniesAndEnrich } from './tableAiTools';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface GenerationParams {
    prompt: string;
    count: number;
    companyContext: string;
}

interface TableCreatorProps {
    onTableCreated: (table: TableData, generationParams?: GenerationParams) => void;
    onCancel: () => void;
    orgId?: string;
    isOpen: boolean;
}

type CreatorMode = 'select' | 'import' | 'ai';

export const TableCreator: React.FC<TableCreatorProps> = ({ onTableCreated, onCancel, orgId, isOpen }) => {
    const { currentOrganization } = useAuth();
    const [mode, setMode] = useState<CreatorMode>('select');
    const [name, setName] = useState('');

    // AI Generation State
    const [aiPrompt, setAiPrompt] = useState('');
    const [rowCount, setRowCount] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    // Default columns for AI generation
    const [columns, setColumns] = useState<Column[]>([
        { id: COMPANY_COLUMN_ID, title: '会社名', type: 'text' },
        { id: 'col_summary', title: '会社概要', type: 'text' },
        { id: 'col_website', title: 'ウェブサイト', type: 'url' },
        { id: 'col_employees', title: '従業員規模', type: 'text' },
        { id: 'col_revenue', title: '想定売上規模', type: 'text' },
        { id: 'col_linkedin', title: 'SNS', type: 'url' },
        {
            id: 'col_fit_score',
            title: 'フィットスコア',
            type: 'tag',
            options: [
                { id: 'high', label: '高', color: 'green' },
                { id: 'medium', label: '中', color: 'yellow' },
                { id: 'low', label: '低', color: 'gray' }
            ]
        },
        { id: 'col_tags', title: 'カテゴリー', type: 'tag' }, // Industry, Product category, etc.
        {
            id: 'col_status',
            title: 'ステータス',
            type: 'tag',
            options: [
                { id: 'uncontacted', label: '未接触', color: 'gray' },
                { id: 'researching', label: '調査中', color: 'blue' },
                { id: 'exclude', label: '除外候補', color: 'red' },
                { id: 'contacted', label: '連絡済み', color: 'green' }
            ]
        },
    ]);

    const handleAiGenerate = async () => {
        if (!name) {
            toast.error('データベース名を入力してください');
            return;
        }
        if (!aiPrompt) {
            toast.error('ターゲット企業の条件を入力してください');
            return;
        }

        setIsGenerating(true);
        try {
            // Create base table structure
            const columnDefinitions = columns.map((col, idx) => ({
                ...columnToDefinition(col, idx),
                textOverflow: 'clip' as const
            }));

            const baseTable: TableData = {
                id: `table_${Date.now()}`,
                org_id: orgId || 'default',
                name,
                description: aiPrompt, // Use prompt as description
                columns: columnDefinitions,
                rows: [],
            };

            // Pass generation params to parent
            const companyContext = currentOrganization?.description || '';

            onTableCreated(baseTable, {
                prompt: aiPrompt,
                count: rowCount,
                companyContext
            });

            onCancel(); // Close dialog
        } catch (e) {
            console.error(e);
            toast.error('リストの作成に失敗しました');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImport = () => {
        toast.info('Excel/XLSXインポート機能は準備中です');
    };

    const resetAndClose = () => {
        setMode('select');
        setName('');
        setAiPrompt('');
        onCancel();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-[600px] bg-white p-0 gap-0 overflow-hidden border-[#E6E8EB] shadow-xl">
                {mode === 'select' && (
                    <>
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-[#0A0B0D]">データベース作成</DialogTitle>
                            <DialogDescription className="text-[#5B616E]">
                                作成方法を選択してください
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('import')}
                                className="flex flex-col items-start p-6 border border-[#E6E8EB] rounded-2xl hover:border-[#0052FF] hover:bg-[#F5F5F7] transition-all group text-left"
                            >
                                <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                                    <IconTable className="w-5 h-5 text-[#5B616E] group-hover:text-[#0052FF]" />
                                </div>
                                <h3 className="text-base font-bold mb-1 text-[#0A0B0D]">Excel / CSV</h3>
                                <p className="text-xs text-[#5B616E] leading-relaxed">
                                    既存のデータをアップロードしてテーブルを作成
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('ai')}
                                className="flex flex-col items-start p-6 border border-[#E6E8EB] rounded-2xl hover:border-[#0052FF] hover:bg-[#F5F5F7] transition-all group text-left"
                            >
                                <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4 group-hover:bg-white transition-colors">
                                    <IconSparkles className="w-5 h-5 text-[#5B616E] group-hover:text-[#0052FF]" />
                                </div>
                                <h3 className="text-base font-bold mb-1 text-[#0A0B0D]">AI リード生成</h3>
                                <p className="text-xs text-[#5B616E] leading-relaxed">
                                    条件を指定して企業リストを自動生成
                                </p>
                            </button>
                        </div>
                    </>
                )}

                {mode === 'ai' && (
                    <>
                        <DialogHeader className="p-8 pb-4 border-b border-[#E6E8EB]">
                            <DialogTitle className="text-xl font-bold tracking-tight text-[#0A0B0D]">AI リード生成</DialogTitle>
                            <DialogDescription className="text-[#5B616E]">
                                ターゲット条件から企業リストを自動生成
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-[#5B616E] uppercase tracking-wider">リスト名</Label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="例: 新規開拓リスト_2024Q1"
                                    className="bg-[#F5F5F7] border-transparent focus:border-[#0052FF] focus:ring-0 rounded-xl font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-[#5B616E] uppercase tracking-wider">ターゲット条件</Label>
                                <div className="relative">
                                    <textarea
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        className="flex w-full rounded-xl border-transparent bg-[#F5F5F7] px-4 py-3 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        rows={4}
                                        placeholder="例: 東京都内の従業員数50名以上のSaaS企業..."
                                    />
                                    <div className="absolute bottom-3 right-3">
                                        <IconSparkles className="w-4 h-4 text-[#0052FF] opacity-50" />
                                    </div>
                                </div>
                                {currentOrganization?.description && (
                                    <p className="text-[10px] text-[#5B616E] flex items-center gap-1">
                                        <IconSparkles className="w-3 h-3" />
                                        あなたの会社情報（{currentOrganization.name}）も考慮されます
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-bold text-[#5B616E] uppercase tracking-wider">生成件数</Label>
                                    <span className="text-xs font-mono font-bold text-[#0A0B0D]">{rowCount}件</span>
                                </div>
                                <Input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={rowCount}
                                    onChange={e => setRowCount(parseInt(e.target.value) || 10)}
                                    className="bg-[#F5F5F7] border-transparent focus:border-[#0052FF] focus:ring-0 rounded-xl font-mono text-sm"
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-8 pt-4 border-t border-[#E6E8EB] bg-white">
                            <Button
                                variant="ghost"
                                onClick={() => setMode('select')}
                                disabled={isGenerating}
                                className="text-[#5B616E] hover:text-[#0A0B0D] hover:bg-[#F5F5F7]"
                            >
                                戻る
                            </Button>
                            <Button
                                onClick={handleAiGenerate}
                                disabled={isGenerating || !name || !aiPrompt}
                                className="bg-[#0A0B0D] text-white hover:bg-black/90 rounded-lg px-8"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-2">
                                        <IconSparkles className="w-4 h-4 animate-spin" />
                                        生成中...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <IconSparkles className="w-4 h-4" />
                                        生成開始
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {mode === 'import' && (
                    <>
                        <DialogHeader className="p-8 pb-4">
                            <DialogTitle className="text-xl font-bold tracking-tight text-[#0A0B0D]">インポート</DialogTitle>
                            <DialogDescription className="text-[#5B616E]">Excel / CSVファイルから作成</DialogDescription>
                        </DialogHeader>

                        <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
                                <IconTable className="w-8 h-8 text-[#5B616E]" />
                            </div>
                            <p className="text-[#5B616E] font-mono text-sm">この機能は現在開発中です</p>
                        </div>

                        <DialogFooter className="p-8 pt-4 border-t border-[#E6E8EB]">
                            <Button
                                variant="ghost"
                                onClick={() => setMode('select')}
                                className="text-[#5B616E] hover:text-[#0A0B0D] hover:bg-[#F5F5F7]"
                            >
                                戻る
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
