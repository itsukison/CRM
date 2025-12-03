'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { createOrganization } from '../../services/organizationService';
import { acceptInvitation } from '../../services/invitationService';
import { COLORS } from '@/config/constants';
import { cn } from '@/lib/utils';

type SetupMode = 'create' | 'join';

export const OrganizationSetupPage: React.FC = () => {
    const router = useRouter();
    const { user, loading, refreshOrganizations } = useAuth();

    // Redirect to signin if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin');
        }
    }, [user, loading, router]);
    const [mode, setMode] = useState<SetupMode>('create');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Create organization state
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');

    // Join organization state
    const [invitationToken, setInvitationToken] = useState('');

    async function handleCreateOrganization(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!orgName.trim()) {
            setError('組織名を入力してください');
            return;
        }

        setSubmitting(true);

        const { organization, error: createError } = await createOrganization(
            orgName,
            orgDescription || undefined
        );

        if (createError) {
            setError(createError.message);
            setSubmitting(false);
        } else if (organization) {
            await refreshOrganizations();
            router.push('/dashboard');
        }
    }

    async function handleJoinOrganization(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!invitationToken.trim()) {
            setError('招待トークンを入力してください');
            return;
        }

        setSubmitting(true);

        const { orgId, error: joinError } = await acceptInvitation(invitationToken);

        if (joinError) {
            setError(joinError.message);
            setSubmitting(false);
        } else if (orgId) {
            await refreshOrganizations();
            router.push('/dashboard');
        }
    }

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#F5F5F7] border-t-[#0052FF] rounded-full animate-spin" />
                    <p className="text-sm text-[#5B616E] font-mono">読み込み中...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-[500px]">
                {/* Logo/Title */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold text-[#0A0B0D] mb-2 font-inter tracking-tight">
                        組織のセットアップ
                    </h1>
                    <p className="text-sm text-[#5B616E] font-inter">
                        新しい組織を作成するか、既存の組織に参加してください
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-8 p-1 bg-[#F5F5F7] rounded-xl border border-[#E6E8EB]">
                    <button
                        onClick={() => setMode('create')}
                        className={cn(
                            "flex-1 py-3 rounded-lg text-sm font-bold font-mono uppercase tracking-wider transition-all duration-200",
                            mode === 'create'
                                ? "bg-white text-[#0A0B0D] shadow-sm"
                                : "text-[#5B616E] hover:text-[#0A0B0D]"
                        )}
                    >
                        新規作成
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className={cn(
                            "flex-1 py-3 rounded-lg text-sm font-bold font-mono uppercase tracking-wider transition-all duration-200",
                            mode === 'join'
                                ? "bg-white text-[#0A0B0D] shadow-sm"
                                : "text-[#5B616E] hover:text-[#0A0B0D]"
                        )}
                    >
                        参加する
                    </button>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl border border-[#E6E8EB] p-8 shadow-sm">
                    {error && (
                        <div className="p-3 mb-6 border border-red-200 bg-red-50 text-red-600 text-sm rounded-lg font-inter">
                            {error}
                        </div>
                    )}

                    {mode === 'create' ? (
                        <form onSubmit={handleCreateOrganization} className="space-y-6">
                            <div>
                                <label className="block mb-2 text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">
                                    組織名 *
                                </label>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                    placeholder="例: Acme Inc."
                                    className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#0A0B0D] placeholder:text-gray-400 focus:border-[#0052FF] focus:ring-0 focus:bg-white transition-all font-inter text-base"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">
                                    会社コンテキスト（AI生成用）
                                </label>
                                <p className="text-xs text-[#5B616E] mb-3 font-inter leading-relaxed">
                                    どのような会社か、主な顧客層、提供している製品・サービスなどを詳しく記述してください。この情報はAIがリード顧客を提案・評価する際に使用されます。
                                </p>
                                <textarea
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="例：当社は中小企業向けにSaaS型の勤怠管理システムを提供しています。主な顧客は従業員数50-300名のIT企業や製造業です。..."
                                    rows={5}
                                    className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#0A0B0D] placeholder:text-gray-400 focus:border-[#0052FF] focus:ring-0 focus:bg-white transition-all font-mono text-sm resize-y"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[#0A0B0D] text-white rounded-xl font-bold font-mono uppercase tracking-wider hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? '作成中...' : '組織を作成'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinOrganization} className="space-y-6">
                            <div>
                                <label className="block mb-2 text-xs font-bold text-[#5B616E] uppercase tracking-wider font-mono">
                                    招待トークン
                                </label>
                                <input
                                    type="text"
                                    value={invitationToken}
                                    onChange={(e) => setInvitationToken(e.target.value)}
                                    required
                                    placeholder="招待トークンを入力してください"
                                    className="w-full px-4 py-3 bg-[#F5F5F7] border-transparent rounded-xl text-[#0A0B0D] placeholder:text-gray-400 focus:border-[#0052FF] focus:ring-0 focus:bg-white transition-all font-mono text-base"
                                />
                                <p className="mt-2 text-xs text-[#5B616E] font-inter">
                                    組織の管理者から送信された招待トークンを入力してください
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[#0A0B0D] text-white rounded-xl font-bold font-mono uppercase tracking-wider hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? '参加中...' : '組織に参加'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Skip Option */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/signin')}
                        className="text-sm text-[#5B616E] hover:text-[#0A0B0D] font-inter underline decoration-gray-300 underline-offset-4 transition-colors"
                    >
                        サインインに戻る
                    </button>
                </div>
            </div>
        </div>
    );
};

