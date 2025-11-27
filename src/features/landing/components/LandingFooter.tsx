'use client';

import React from 'react';
import { COLORS } from '@/config/constants';

export const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-[#0A0B0D] text-white pt-20 pb-10 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                {/* Top Section: Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-10 md:mb-32">
                    {/* Column 1: Product */}
                    <div>
                        <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-400">プロダクト</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">機能一覧</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">料金プラン</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">導入事例</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">APIドキュメント</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">アップデート情報</a></li>
                        </ul>
                    </div>

                    {/* Column 2: Company */}
                    <div>
                        <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-400">会社情報</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">ミッション・バリュー</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">ニュース</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div>
                        <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-400">法的情報</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">セキュリティ</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Connect */}
                    <div>
                        <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-400">ソーシャル</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Twitter <span className="text-xs text-gray-500">↗</span></a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">GitHub <span className="text-xs text-gray-500">↗</span></a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">LinkedIn <span className="text-xs text-gray-500">↗</span></a></li>
                            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">Note <span className="text-xs text-gray-500">↗</span></a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Status */}
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-800 pt-8 pb-8 md:pb-0">
                    <div className="text-xs text-gray-500 font-mono mb-4 md:mb-0">
                        &copy; 2025 flowly Labs Inc. All rights reserved.
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        SYSTEM STATUS: OPERATIONAL
                    </div>
                </div>
            </div>

            {/* Massive Branding 
                - Mobile: text-[28vw] (bigger), bottom-[-4vw]
                - Desktop: text-[16vw] (smaller), bottom-[-2vw]
            */}
            <div className="absolute bottom-[-4vw] md:bottom-[-2vw] left-0 w-full text-left px-6 md:px-12 pointer-events-none select-none z-0">
                <h1 className="text-[28vw] md:text-[16vw] leading-none font-bold tracking-tighter text-[#1A1C21] font-mono whitespace-nowrap">
                    flowly
                </h1>
            </div>
        </footer>
    );
};