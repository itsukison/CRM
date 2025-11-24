import React from 'react';
import { DataMap } from '@/ui/graphics';
import { IconChevronRight } from '@/components/Icons';
import { COLORS } from '@/config/constants';

interface LandingHeroProps {
    onEnter: () => void;
}

/**
 * Hero section for landing page
 * Features headline, CTA buttons, and animated data visualization
 */
export const LandingHero: React.FC<LandingHeroProps> = ({ onEnter }) => {
    return (
        <section className="relative pt-40 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-[10px] font-mono font-bold tracking-widest mb-8 border border-gray-200">
                        <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                        AI_NATIVE_OS v2.1
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 font-noto">
                        データ入力から解放される、<br />
                        <span style={{ color: COLORS.BLUE }}>AI駆動型CRM。</span>
                    </h1>

                    <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10 font-medium">
                        スキーマを定義するだけで、AIが自動的にリード情報を生成・収集。
                        Web検索による最新データの取得から、自然言語による高度な分析まで。
                        営業活動の本質に集中できる、次世代の顧客管理基盤です。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onEnter}
                            className="px-8 py-4 text-white text-sm font-bold uppercase tracking-wider hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group shadow-xl border-2 border-blue-600"
                            style={{ backgroundColor: COLORS.BLUE }}
                        >
                            無料で始める
                            <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            className="px-8 py-4 text-black text-sm font-bold uppercase tracking-wider border-2 border-gray-800 hover:bg-gray-50 transition-colors font-mono bg-white"
                        >
                            ドキュメント
                        </button>
                    </div>
                </div>

                {/* Right Visual: The Data Map */}
                <div className="relative h-[500px] w-full hidden lg:block">
                    <div className="absolute inset-0 border-2 border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm">
                        <DataMap />
                        {/* Floating Info Cards overlaying map */}
                        <div className="absolute top-10 right-10 bg-white p-4 border-2 border-gray-200 shadow-xl max-w-[180px] group hover:border-gray-800 transition-colors">
                            <div className="text-[9px] font-mono text-gray-400 uppercase mb-1">Active Leads</div>
                            <div className="text-3xl font-bold text-[#0A0B0D] tracking-tighter">14,203</div>
                            <div className="h-1.5 w-full bg-gray-100 mt-3"><div className="h-full w-3/4" style={{ backgroundColor: COLORS.PINK }}></div></div>
                        </div>
                        <div className="absolute bottom-20 left-10 bg-white p-4 border-2 border-gray-200 shadow-xl max-w-[180px] group hover:border-gray-800 transition-colors">
                            <div className="text-[9px] font-mono text-gray-400 uppercase mb-1">Enriched Data</div>
                            <div className="text-3xl font-bold text-[#0A0B0D] tracking-tighter">98.4%</div>
                            <div className="h-1.5 w-full bg-gray-100 mt-3"><div className="h-full w-[98%]" style={{ backgroundColor: COLORS.GREEN }}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
