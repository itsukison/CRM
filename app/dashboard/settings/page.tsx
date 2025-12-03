'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { COLORS } from '@/config/constants';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { toast } from 'sonner';
import { IconUser } from '@/components/Icons';

export default function SettingsPage() {
    const { user, signOut, currentOrganization, refreshOrganizations } = useAuth();
    const [orgName, setOrgName] = React.useState('');
    const [orgDescription, setOrgDescription] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (currentOrganization) {
            setOrgName(currentOrganization.name);
            setOrgDescription(currentOrganization.description || '');
        }
    }, [currentOrganization]);

    const handleSaveOrg = async () => {
        if (!currentOrganization) return;
        setIsSaving(true);
        try {
            const { updateOrganization } = await import('@/services/organizationService');
            const { error } = await updateOrganization(currentOrganization.id, { name: orgName, description: orgDescription });

            if (error) {
                toast.error('組織情報の更新に失敗しました');
            } else {
                toast.success('組織情報を更新しました');
                refreshOrganizations();
            }
        } catch (e) {
            console.error(e);
            toast.error('エラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-12 animate-in fade-in duration-500 overflow-y-auto h-full bg-white">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-[#0A0B0D] mb-2 font-inter">設定</h1>
                    <p className="text-[#5B616E] font-inter">アカウントと組織の設定を管理します。</p>
                </div>

                {/* Organization Settings */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-[#0A0B0D] mb-8 font-inter">
                        組織設定
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                現在の組織
                            </label>
                            <div className="flex items-center gap-4">
                                <OrganizationSwitcher />
                                <p className="text-sm text-[#5B616E] font-inter">
                                    利用可能な組織を切り替えます。
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                    組織名
                                </label>
                                <Input
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="max-w-md bg-[#F5F5F7] border-transparent focus:border-[#0052FF] focus:ring-0 rounded-xl font-inter text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                    会社コンテキスト（AI生成用）
                                </label>
                                <p className="text-xs text-[#5B616E] mb-3 font-inter leading-relaxed max-w-2xl">
                                    どのような会社か、主な顧客層、提供している製品・サービスなどを詳しく記述してください。この情報はAIがリード顧客を提案・評価する際に使用されます。
                                </p>
                                <textarea
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    className="flex w-full max-w-2xl rounded-xl border-transparent bg-[#F5F5F7] px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y"
                                    rows={5}
                                    placeholder="例：当社は中小企業向けにSaaS型の勤怠管理システムを提供しています。主な顧客は従業員数50-300名のIT企業や製造業です。..."
                                />
                            </div>
                            <div className="flex justify-start">
                                <Button
                                    onClick={handleSaveOrg}
                                    disabled={isSaving}
                                    className="bg-[#0A0B0D] text-white hover:bg-black/90 rounded-lg font-bold font-mono uppercase tracking-wider px-6"
                                >
                                    {isSaving ? '保存中...' : '変更を保存'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Settings */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-[#0A0B0D] mb-8 font-inter">
                        アカウント
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                メールアドレス
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#5B616E]">
                                    <IconUser className="w-5 h-5" />
                                </div>
                                <span className="font-mono text-[#0A0B0D] text-sm">
                                    {user?.email}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                セッション
                            </label>
                            <button
                                onClick={() => signOut()}
                                className="px-4 py-2 bg-white border border-[#E6E8EB] text-[#5B616E] hover:text-[#D93025] hover:border-[#D93025] hover:bg-[#FFF5F5] rounded-xl text-sm font-bold transition-all duration-200 font-mono uppercase tracking-wider"
                            >
                                サインアウト
                            </button>
                        </div>
                    </div>
                </section>

                {/* System Info */}
                <section>
                    <h2 className="text-xl font-bold text-[#0A0B0D] mb-8 font-inter">
                        システム
                    </h2>

                    <div className="bg-[#F5F5F7] rounded-2xl p-6 border border-transparent max-w-md">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[#4B7C0F] animate-pulse"></div>
                            <span className="text-xs font-bold text-[#4B7C0F] uppercase tracking-wider font-mono">System Operational</span>
                        </div>
                        <p className="text-xs text-[#5B616E] font-mono">
                            Version 1.0.0-beta
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
