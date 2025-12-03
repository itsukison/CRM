import React from 'react';
import { IconSparkles, IconBolt, IconX, IconLoader, IconCheck, IconAlertTriangle } from '@/components/Icons';
import { EnrichmentProgress, GenerationProgress } from '@/services/enrichmentService';

interface AIProgressWindowProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'generation' | 'enrichment';
    progress: GenerationProgress | Map<string, EnrichmentProgress> | null;
    onCancel?: () => void;
}

export const AIProgressWindow: React.FC<AIProgressWindowProps> = ({
    isOpen,
    onClose,
    type,
    progress,
    onCancel
}) => {
    if (!isOpen || !progress) return null;

    // Helper to extract status from progress
    const getStatus = () => {
        if (type === 'generation') {
            const genProgress = progress as GenerationProgress;
            if (!genProgress) return { phase: 'idle', message: '待機中...', count: 0, total: 0 };

            let message = '';
            switch (genProgress.phase) {
                case 'generating_names':
                    message = '企業リストを生成中...';
                    break;
                case 'enriching_details':
                    message = `詳細情報を取得中... ${genProgress.currentColumn ? `(${genProgress.currentColumn})` : ''}`;
                    break;
                case 'complete':
                    message = '完了しました';
                    break;
                default:
                    message = '処理中...';
            }

            return {
                phase: genProgress.phase,
                message,
                count: genProgress.currentRow || 0,
                total: genProgress.totalRows || 0
            };
        } else {
            // Enrichment Progress (Map)
            const enrichProgress = progress as Map<string, EnrichmentProgress>;
            const items = Array.from(enrichProgress.values());
            const total = items.length;
            const completed = items.filter(i => i.phase === 'complete' || i.phase === 'error').length;
            const current = items.find(i => i.phase !== 'complete' && i.phase !== 'error');

            let phase = 'idle';
            let message = '待機中...';

            if (total === 0) {
                // Initial state or cleared
            } else if (completed === total) {
                phase = 'complete';
                message = '完了しました';
            } else {
                phase = 'enriching';
                if (current) {
                    if (current.phase === 'discovery') message = 'URLを検索中...';
                    else if (current.phase === 'extraction') message = '情報を抽出中...';
                    else if (current.phase === 'financial') message = '財務情報を取得中...';
                    else message = '処理中...';
                } else {
                    message = '処理中...';
                }
            }

            return {
                phase,
                message,
                count: completed,
                total
            };
        }
    };

    const status = getStatus();
    const percent = status.total > 0 ? Math.round((status.count / status.total) * 100) : 0;
    const isComplete = status.phase === 'complete';

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white border border-[#E6E8EB] rounded-xl shadow-2xl w-[320px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                        {type === 'generation' ? (
                            <IconSparkles className="w-4 h-4 text-[#0052FF]" />
                        ) : (
                            <IconBolt className="w-4 h-4 text-[#0052FF]" />
                        )}
                        <span className="text-xs font-bold text-[#0A0B0D] font-mono">
                            {type === 'generation' ? 'AIデータ生成' : 'データ拡充'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {isComplete ? (
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-[#E6E8EB] rounded-md text-[#5B616E] transition-colors"
                            >
                                <IconX className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="text-[10px] text-[#5B616E] hover:text-[#FC401F] px-2 py-1 rounded hover:bg-[#FFF5F5] transition-colors font-mono"
                                >
                                    キャンセル
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#0A0B0D] font-mono">
                            {status.message}
                        </span>
                        <span className="text-[10px] font-mono text-[#5B616E]">
                            {status.count} / {status.total}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden mb-3">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-[#34C759]' : 'bg-[#0052FF]'}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>

                    {/* Status Detail */}
                    <div className="flex items-center gap-2 text-[10px] text-[#5B616E] font-mono bg-[#F5F5F7] px-2 py-1.5 rounded-lg">
                        {isComplete ? (
                            <IconCheck className="w-3 h-3 text-[#34C759]" />
                        ) : (
                            <IconLoader className="w-3 h-3 animate-spin text-[#0052FF]" />
                        )}
                        <span className="truncate flex-1">
                            {isComplete ? 'すべての処理が完了しました' : 'バックグラウンドで処理を実行中...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
