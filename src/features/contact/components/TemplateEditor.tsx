'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { EmailTemplate } from '../types';

interface TemplateEditorProps {
    template: EmailTemplate | null;
    onSave: (data: { name: string; subject: string; body: string; variables: string[] }) => Promise<void>;
    onClose: () => void;
}

// Extract variables from text using {variable} syntax
function extractVariables(text: string): string[] {
    const regex = /\{([^}]+)\}/g;
    const variables: Set<string> = new Set();
    let match;
    while ((match = regex.exec(text)) !== null) {
        variables.add(match[1].trim());
    }
    return Array.from(variables);
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    template,
    onSave,
    onClose,
}) => {
    const [name, setName] = useState(template?.name || '');
    const [subject, setSubject] = useState(template?.subject || '');
    const [body, setBody] = useState(template?.body || '');
    const [customVariables, setCustomVariables] = useState<string[]>(template?.variables || []);
    const [newVariable, setNewVariable] = useState('');
    const [saving, setSaving] = useState(false);

    // Auto-detect variables from subject and body
    const detectedVariables = useMemo(() => {
        const subjectVars = extractVariables(subject);
        const bodyVars = extractVariables(body);
        return [...new Set([...subjectVars, ...bodyVars])];
    }, [subject, body]);

    // Combine detected and custom variables
    const allVariables = useMemo(() => {
        return [...new Set([...detectedVariables, ...customVariables])];
    }, [detectedVariables, customVariables]);

    const handleAddVariable = () => {
        const trimmed = newVariable.trim();
        if (trimmed && !allVariables.includes(trimmed)) {
            setCustomVariables([...customVariables, trimmed]);
            setNewVariable('');
        }
    };

    const handleRemoveVariable = (variable: string) => {
        setCustomVariables(customVariables.filter((v) => v !== variable));
    };

    const handleInsertVariable = (variable: string) => {
        // Insert at cursor position in body
        const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newBody = body.slice(0, start) + `{${variable}}` + body.slice(end);
            setBody(newBody);
            // Set cursor position after inserted variable
            setTimeout(() => {
                textarea.focus();
                const newPos = start + variable.length + 2;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !subject.trim() || !body.trim()) {
            alert('必須項目をすべて入力してください');
            return;
        }

        try {
            setSaving(true);
            await onSave({
                name: name.trim(),
                subject: subject.trim(),
                body: body.trim(),
                variables: allVariables,
            });
        } catch (err) {
            console.error('Error saving template:', err);
            alert('テンプレートの保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-sm border border-[#DEE1E7] shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE1E7]">
                    <h2 className="text-lg font-bold text-[#0A0B0D]">
                        {template ? 'テンプレートを編集' : '新規テンプレート'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-[#717886] hover:text-[#0A0B0D] transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Template Name */}
                    <div className="mb-4">
                        <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                            テンプレート名 *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例: ウェルカムメール"
                            className="w-full px-3 py-2 text-sm border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF] text-[#0A0B0D]"
                        />
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                            件名 *
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="例: {company_name} へようこそ！"
                            className="w-full px-3 py-2 text-sm font-mono border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF] text-[#0A0B0D]"
                        />
                        <p className="text-[10px] text-[#B1B7C3] mt-1">
                            {'{変数名}'} の形式で動的な内容を挿入できます
                        </p>
                    </div>

                    {/* Body */}
                    <div className="mb-4">
                        <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                            本文 *
                        </label>
                        <textarea
                            id="template-body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={`{first_name} 様\n\n{company_name} にご関心をお寄せいただきありがとうございます。\n\n何卒よろしくお願いいたします。\n{sender_name}`}
                            rows={10}
                            className="w-full px-3 py-2 text-sm font-mono border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF] text-[#0A0B0D] resize-none"
                        />
                    </div>

                    {/* Variables */}
                    <div className="mb-4">
                        <label className="block text-xs font-mono font-medium text-[#5B616E] uppercase tracking-wider mb-2">
                            変数
                        </label>
                        
                        {/* Variable List */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {allVariables.length === 0 ? (
                                <span className="text-xs text-[#B1B7C3]">
                                    変数が検出されませんでした。{'{変数名}'} の形式で追加してください。
                                </span>
                            ) : (
                                allVariables.map((variable) => (
                                    <span
                                        key={variable}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF0F3] text-[#32353D] text-xs font-mono rounded-sm group"
                                    >
                                        <button
                                            onClick={() => handleInsertVariable(variable)}
                                            className="hover:text-[#0000FF]"
                                            title="本文に挿入"
                                        >
                                            {`{${variable}}`}
                                        </button>
                                        {!detectedVariables.includes(variable) && (
                                            <button
                                                onClick={() => handleRemoveVariable(variable)}
                                                className="text-[#B1B7C3] hover:text-[#FC401F] opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="削除"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>

                        {/* Add Custom Variable */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newVariable}
                                onChange={(e) => setNewVariable(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddVariable();
                                    }
                                }}
                                placeholder="カスタム変数を追加"
                                className="flex-1 px-3 py-1.5 text-xs font-mono border border-[#DEE1E7] rounded-sm focus:outline-none focus:border-[#0000FF] text-[#0A0B0D]"
                            />
                            <button
                                onClick={handleAddVariable}
                                disabled={!newVariable.trim()}
                                className="px-3 py-1.5 bg-[#EEF0F3] text-[#5B616E] text-xs font-mono rounded-sm hover:bg-[#DEE1E7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#DEE1E7] bg-[#FAFAFA]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-[#5B616E] hover:text-[#0A0B0D] transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim() || !subject.trim() || !body.trim()}
                        className="px-4 py-2 bg-[#0000FF] text-white text-sm font-medium rounded-sm hover:bg-[#3C8AFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saving ? '保存中...' : template ? '更新する' : '作成する'}
                    </button>
                </div>
            </div>
        </div>
    );
};

