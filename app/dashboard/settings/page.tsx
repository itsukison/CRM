'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { COLORS } from '@/config/constants';

export default function SettingsPage() {
    const { user, signOut } = useAuth();

    return (
        <div className="p-12 animate-in fade-in duration-500 overflow-y-auto h-full">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-[#0A0B0D] mb-2 font-inter">Settings</h1>
                <p className="text-[#5B616E] mb-12 font-inter">Manage your account and organization preferences.</p>

                {/* Organization Settings */}
                <section className="mb-12">
                    <h2 className="text-lg font-bold text-[#0A0B0D] mb-6 font-inter border-b border-[#E6E8EB] pb-2">
                        Organization
                    </h2>

                    <div className="bg-white rounded-2xl border border-[#E6E8EB] p-8">
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                    Current Organization
                                </label>
                                <div className="flex items-center gap-4">
                                    <OrganizationSwitcher />
                                    <p className="text-sm text-[#5B616E]">
                                        Switch between your available organizations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Settings */}
                <section className="mb-12">
                    <h2 className="text-lg font-bold text-[#0A0B0D] mb-6 font-inter border-b border-[#E6E8EB] pb-2">
                        Account
                    </h2>

                    <div className="bg-white rounded-2xl border border-[#E6E8EB] p-8">
                        <div className="grid gap-8">
                            <div>
                                <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-mono text-[#0A0B0D] bg-[#F5F5F7] px-3 py-1.5 rounded-lg border border-[#E6E8EB]">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#5B616E] uppercase tracking-wider mb-2 font-mono">
                                    Session
                                </label>
                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 bg-white border border-[#E6E8EB] text-[#5B616E] hover:text-[#D93025] hover:border-[#D93025] hover:bg-[#FFF5F5] rounded-xl text-sm font-bold transition-all duration-200"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Info */}
                <section>
                    <h2 className="text-lg font-bold text-[#0A0B0D] mb-6 font-inter border-b border-[#E6E8EB] pb-2">
                        System
                    </h2>

                    <div className="bg-[#F5F5F7] rounded-2xl p-6 border border-[#E6E8EB]">
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
