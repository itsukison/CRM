'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { useGmailConnection } from '../hooks/useGmailConnection';
import {
    sendBulkEmails,
    replaceVariables,
    detectEmailColumns,
    isValidEmail,
    type BulkSendProgress,
} from '@/services/email/gmail.service';
import type { EmailTemplate, VariableMapping } from '../types';
import type { Column, Row } from '@/types';

interface SendEmailModalProps {
    orgId: string;
    userId: string;
    columns: Column[];
    rows: Row[];
    selectedRowIds: Set<string>;
    selectedCellIds: Set<string>;
    onClose: () => void;
    onComplete?: () => void;
}

type Step = 'provider' | 'template' | 'mapping' | 'preview' | 'sending' | 'complete';

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
    orgId,
    userId,
    columns,
    rows,
    selectedRowIds,
    selectedCellIds,
    onClose,
    onComplete,
}) => {
    const { connection, loading: connectionLoading, connect } = useGmailConnection(userId);
    const { templates, loading: templatesLoading } = useTemplates(orgId);

    const [step, setStep] = useState<Step>('provider');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedEmailColumnId, setSelectedEmailColumnId] = useState<string>('');
    const [mappings, setMappings] = useState<VariableMapping[]>([]);
    const [progress, setProgress] = useState<BulkSendProgress | null>(null);
    const [result, setResult] = useState<{ successful: number; failed: number; errors: string[] } | null>(null);

    // Detect email columns
    const emailColumns = useMemo(() => detectEmailColumns(columns), [columns]);

    // Get selected rows
    const selectedRows = useMemo(() => {
        // If rows are selected via checkbox
        if (selectedRowIds.size > 0) {
            return rows.filter((r) => selectedRowIds.has(r.id) && !r.isPlaceholder);
        }
        // If cells are selected, get unique rows
        if (selectedCellIds.size > 0) {
            const rowIds = new Set(Array.from(selectedCellIds).map((cellId) => cellId.split(':')[0]));
            return rows.filter((r) => rowIds.has(r.id) && !r.isPlaceholder);
        }
        return [];
    }, [rows, selectedRowIds, selectedCellIds]);

    // Get selected template
    const selectedTemplate = useMemo(
        () => templates.find((t) => t.id === selectedTemplateId),
        [templates, selectedTemplateId]
    );

    // Auto-select email column if only one
    useEffect(() => {
        if (emailColumns.length === 1 && !selectedEmailColumnId) {
            setSelectedEmailColumnId(emailColumns[0].id);
        }
    }, [emailColumns, selectedEmailColumnId]);

    // Initialize mappings when template changes
    useEffect(() => {
        if (selectedTemplate) {
            const initialMappings: VariableMapping[] = selectedTemplate.variables.map((variable) => {
                // Try to auto-match variable to column
                const matchingColumn = columns.find(
                    (col) => col.name.toLowerCase().replace(/[^a-z0-9]/g, '') === variable.toLowerCase().replace(/[^a-z0-9]/g, '')
                );
                return {
                    variable,
                    columnId: matchingColumn?.id || '',
                };
            });
            setMappings(initialMappings);
        }
    }, [selectedTemplate, columns]);

    // Check if ready to proceed
    useEffect(() => {
        if (connection && step === 'provider') {
            setStep('template');
        }
    }, [connection, step]);

    // Get recipients with valid emails
    const validRecipients = useMemo(() => {
        if (!selectedEmailColumnId) return [];
        
        return selectedRows
            .map((row) => ({
                email: String(row[selectedEmailColumnId] || ''),
                rowData: row,
            }))
            .filter((r) => isValidEmail(r.email));
    }, [selectedRows, selectedEmailColumnId]);

    // Check if all variables are mapped
    const allVariablesMapped = useMemo(() => {
        return mappings.every((m) => m.columnId);
    }, [mappings]);

    // Preview for first row
    const previewEmail = useMemo(() => {
        if (!selectedTemplate || !validRecipients[0]) return null;
        
        return {
            to: validRecipients[0].email,
            subject: replaceVariables(selectedTemplate.subject, mappings, validRecipients[0].rowData),
            body: replaceVariables(selectedTemplate.body, mappings, validRecipients[0].rowData),
        };
    }, [selectedTemplate, mappings, validRecipients]);

    const handleSend = async () => {
        if (!selectedTemplate || validRecipients.length === 0) return;

        setStep('sending');

        const results = await sendBulkEmails(
            selectedTemplate,
            validRecipients,
            mappings,
            orgId,
            userId,
            setProgress
        );

        setResult(results);
        setStep('complete');
    };

    const handleClose = () => {
        if (step === 'sending') return; // Prevent closing while sending
        onClose();
        if (step === 'complete' && onComplete) {
            onComplete();
        }
    };

    // Render progress bar
    const renderProgress = () => {
        if (!progress) return null;
        const percent = Math.round((progress.completed / progress.total) * 100);
        const blocks = Math.floor(percent / 10);
        const bar = '█'.repeat(blocks) + '░'.repeat(10 - blocks);

        return (
            <div className="text-center py-8">
                <div className="font-mono text-lg text-[#0A0B0D] mb-4">
                    [{bar}] {percent}%
                </div>
                <div className="text-sm text-[#717886] mb-2">
                    送信中 {progress.completed} / {progress.total}
                </div>
                {progress.currentEmail && (
                    <div className="text-xs font-mono text-[#B1B7C3]">
                        送信先: {progress.currentEmail}
                    </div>
                )}
                <div className="flex justify-center gap-4 mt-4 text-xs">
                    <span className="text-[#66C800]">● 成功 {progress.successful}件</span>
                    <span className="text-[#FC401F]">● 失敗 {progress.failed}件</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-hidden rounded-sm border border-[#DEE1E7] shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE1E7]">
                    <h2 className="text-lg font-bold text-[#0A0B0D]">メール送信</h2>
                    {step !== 'sending' && (
                        <button
                            onClick={handleClose}
                            className="p-1 text-[#717886] hover:text-[#0A0B0D] transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Step: Provider */}
                    {step === 'provider' && (
                        <div className="text-center py-8">
                            {connectionLoading ? (
                                <div className="font-mono text-[#717886]">接続を確認中...</div>
                            ) : connection ? (
                                <div>
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <div className="w-2 h-2 bg-[#66C800] rounded-full" />
                                        <span className="font-mono text-[#32353D]">{connection.email}</span>
                                    </div>
                                    <button
                                        onClick={() => setStep('template')}
                                        className="px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium"
                                    >
                                        続ける
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-[#717886] mb-4">メール送信にはGmailアカウントの連携が必要です</p>
                                    <button
                                        onClick={connect}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium mx-auto"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        Gmail を連携
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Template */}
                    {step === 'template' && (
                        <div>
                            {/* Email Column Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                                    メールアドレス列
                                </label>
                                {emailColumns.length === 0 ? (
                                    <p className="text-sm text-[#FC401F]">
                                        メール列が見つかりません。列タイプが「mail」または名前に「email」を含む列を追加してください。
                                    </p>
                                ) : (
                                    <select
                                        value={selectedEmailColumnId}
                                        onChange={(e) => setSelectedEmailColumnId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF]"
                                    >
                                        <option value="">列を選択</option>
                                        {emailColumns.map((col) => (
                                            <option key={col.id} value={col.id}>
                                                {col.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Template Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                                    テンプレート
                                </label>
                                {templatesLoading ? (
                                    <div className="h-10 bg-[#EEF0F3] animate-pulse rounded-sm" />
                                ) : templates.length === 0 ? (
                                    <p className="text-sm text-[#717886]">
                                        テンプレートがありません。<a href="/dashboard/contact" className="text-[#0000FF] hover:underline">先に作成してください</a>。
                                    </p>
                                ) : (
                                    <select
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF]"
                                    >
                                        <option value="">テンプレートを選択</option>
                                        {templates.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Recipients Count */}
                            <div className="p-3 bg-[#EEF0F3] rounded-sm mb-6">
                                <div className="text-xs font-mono text-[#5B616E] uppercase tracking-wider mb-1">
                                    送信先
                                </div>
                                <div className="text-lg font-bold text-[#0A0B0D]">
                                    {validRecipients.length}件 <span className="text-sm font-normal text-[#717886]">の有効なメールアドレス</span>
                                </div>
                                {selectedRows.length > validRecipients.length && (
                                    <p className="text-xs text-[#FC401F] mt-1">
                                        {selectedRows.length - validRecipients.length}件の行にメールアドレスがないか無効です
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => setStep('mapping')}
                                disabled={!selectedTemplateId || !selectedEmailColumnId || validRecipients.length === 0}
                                className="w-full px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                次へ: 変数をマッピング
                            </button>
                        </div>
                    )}

                    {/* Step: Mapping */}
                    {step === 'mapping' && selectedTemplate && (
                        <div>
                            <p className="text-sm text-[#717886] mb-4">
                                テンプレートの変数をテーブルの列に対応付けてください
                            </p>

                            {mappings.length === 0 ? (
                                <p className="text-sm text-[#B1B7C3] italic mb-6">
                                    このテンプレートには変数がありません
                                </p>
                            ) : (
                                <div className="space-y-3 mb-6">
                                    {mappings.map((mapping, index) => (
                                        <div key={mapping.variable} className="flex items-center gap-3">
                                            <span className="px-2 py-1 bg-[#EEF0F3] text-[#32353D] text-xs font-mono rounded-sm min-w-[120px]">
                                                {`{${mapping.variable}}`}
                                            </span>
                                            <span className="text-[#B1B7C3]">→</span>
                                            <select
                                                value={mapping.columnId}
                                                onChange={(e) => {
                                                    const newMappings = [...mappings];
                                                    newMappings[index].columnId = e.target.value;
                                                    setMappings(newMappings);
                                                }}
                                                className="flex-1 px-3 py-1.5 text-sm border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF]"
                                            >
                                                <option value="">列を選択</option>
                                                {columns.filter((c) => !c.isPlaceholder).map((col) => (
                                                    <option key={col.id} value={col.id}>
                                                        {col.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('template')}
                                    className="px-4 py-2 text-[#5B616E] hover:text-[#0A0B0D] transition-colors"
                                >
                                    戻る
                                </button>
                                <button
                                    onClick={() => setStep('preview')}
                                    disabled={!allVariablesMapped}
                                    className="flex-1 px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    次へ: プレビュー
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Preview */}
                    {step === 'preview' && previewEmail && (
                        <div>
                            <p className="text-xs font-mono text-[#717886] mb-4">
                                プレビュー（1件目の送信先）
                            </p>

                            <div className="border border-[#DEE1E7] rounded-sm overflow-hidden mb-6">
                                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#DEE1E7]">
                                    <div className="text-xs text-[#717886]">宛先:</div>
                                    <div className="font-mono text-sm">{previewEmail.to}</div>
                                </div>
                                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#DEE1E7]">
                                    <div className="text-xs text-[#717886]">件名:</div>
                                    <div className="font-medium text-sm">{previewEmail.subject}</div>
                                </div>
                                <div className="px-4 py-3 bg-white">
                                    <div className="text-xs text-[#717886] mb-1">本文:</div>
                                    <pre className="text-sm whitespace-pre-wrap font-sans text-[#32353D]">
                                        {previewEmail.body}
                                    </pre>
                                </div>
                            </div>

                            <div className="p-3 bg-[#EEF0F3] rounded-sm mb-6">
                                <div className="text-sm font-medium text-[#0A0B0D]">
                                    {validRecipients.length}件の宛先に送信します
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('mapping')}
                                    className="px-4 py-2 text-[#5B616E] hover:text-[#0A0B0D] transition-colors"
                                >
                                    戻る
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="flex-1 px-4 py-2 bg-[#0000FF] text-white rounded-sm text-sm font-medium"
                                >
                                    送信する
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Sending */}
                    {step === 'sending' && renderProgress()}

                    {/* Step: Complete */}
                    {step === 'complete' && result && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: result.failed === 0 ? '#66C800' : '#FFD12F' }}>
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#0A0B0D] mb-2">
                                送信完了
                            </h3>
                            <div className="flex justify-center gap-4 text-sm mb-6">
                                <span className="text-[#66C800]">● 成功 {result.successful}件</span>
                                <span className="text-[#FC401F]">● 失敗 {result.failed}件</span>
                            </div>
                            {result.errors.length > 0 && (
                                <div className="text-left bg-[#FC401F]/10 p-3 rounded-sm mb-6 max-h-32 overflow-y-auto">
                                    <div className="text-xs font-mono text-[#FC401F]">
                                        {result.errors.map((err, i) => (
                                            <div key={i}>{err}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 bg-[#0A0B0D] text-white rounded-sm text-sm font-medium"
                            >
                                閉じる
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

