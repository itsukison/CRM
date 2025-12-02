'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateList } from './components/TemplateList';
import { ActivityTable } from './components/ActivityTable';
import { useGmailConnection } from './hooks/useGmailConnection';
import type { ContactTab } from './types';

const TABS: { id: ContactTab; label: string }[] = [
    { id: 'templates', label: 'テンプレート' },
    { id: 'activity', label: '送信履歴' },
];

export default function ContactPage() {
    const { user, currentOrganization } = useAuth();
    const [activeTab, setActiveTab] = useState<ContactTab>('templates');
    const { connection, loading: connectionLoading, connect } = useGmailConnection(user?.id);

    const orgId = currentOrganization?.id || '';

    if (!orgId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center font-mono text-[#717886]">
                    <p>組織を選択してください</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="border-b border-[#DEE1E7] bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-[#0A0B0D]">
                            メール配信
                        </h1>
                        <p className="text-xs text-[#5B616E] mt-1">
                            テンプレート管理と送信履歴
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-[#F5F5F7] p-1 rounded-full">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${activeTab === tab.id
                                        ? 'bg-white text-[#0A0B0D] shadow-sm'
                                        : 'text-[#5B616E] hover:text-[#0A0B0D]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Gmail Connection Status */}
                    <div className="flex items-center gap-3">
                        {connectionLoading ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EEF0F3] rounded-sm">
                                <div className="w-2 h-2 bg-[#B1B7C3] rounded-full animate-pulse" />
                                <span className="text-xs font-mono text-[#717886]">確認中...</span>
                            </div>
                        ) : connection ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EEF0F3] rounded-sm">
                                <div className="w-2 h-2 bg-[#66C800] rounded-full" />
                                <span className="text-xs font-mono text-[#32353D]">
                                    {connection.email}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={connect}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0A0B0D] text-white rounded-xl text-sm font-medium hover:bg-[#2C2D30] transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                Gmail を連携
                            </button>
                        )}
                    </div>
                </div>


            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-[#FAFAFA]">
                {activeTab === 'templates' ? (
                    <TemplateList orgId={orgId} />
                ) : (
                    <ActivityTable orgId={orgId} />
                )}
            </div>
        </div>
    );
}

