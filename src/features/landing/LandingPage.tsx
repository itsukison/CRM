'use client';

import React, { useState, useEffect } from 'react';
import { PixelGrid } from '@/ui/graphics';
import { COLORS } from '@/config/constants';
import { LandingHero } from './components/LandingHero';
import { LandingConcept } from './components/LandingConcept';
import { LandingWorkflow } from './components/LandingWorkflow';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingPricing } from './components/LandingPricing';

interface LandingPageProps {
    onEnter: () => void;
}

/**
 * Main landing page container
 * Orchestrates all landing page sections with navigation
 */
export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-[#0A0B0D] selection:bg-blue-100">
            <PixelGrid />

            {/* --- Navigation --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-sm border-gray-200 py-3' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={onEnter}>
                        <div className="w-5 h-5 transition-transform duration-500" style={{ backgroundColor: COLORS.BLUE }}></div>
                        <span className="font-bold text-lg tracking-tight font-mono">flowly</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                        <a href="#concept" className="hover:text-blue-600 transition-colors">コンセプト</a>
                        <a href="#features" className="hover:text-blue-600 transition-colors">機能</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">料金</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onEnter}
                            className="px-4 py-2 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors border-2 border-gray-200 rounded-full"
                        >
                            ログイン
                        </button>
                        <button
                            onClick={onEnter}
                            className="px-4 py-2 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg rounded-full"
                            style={{ backgroundColor: COLORS.BLUE }}
                        >
                            無料で始める
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Sections */}
            <LandingHero onEnter={onEnter} />
            <LandingConcept />
            <LandingWorkflow />
            <LandingFeatures />
            <LandingPricing onEnter={onEnter} />

            {/* --- Q&A Section --- */}
            <section className="py-16 md:py-24 bg-white border-t border-gray-200">
                <div className="max-w-[1000px] mx-auto px-6 md:px-12">
                    <div className="mb-8 md:mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                            よくある質問
                        </h2>
                        <p className="text-gray-500 text-sm font-mono">FAQ</p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-[#E6E8EB] hover:border-gray-800 transition-all rounded-2xl">
                            <div className="p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: COLORS.BLUE }}>Q1</span>
                                    <span>従来のCRMとの違いは何ですか？</span>
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    従来のCRMは手動でデータを入力・管理するツールですが、flowlyはAIが自動的にリード情報を生成・収集します。営業チームはデータ入力ではなく、戦略立案と商談に専念できます。
                                </p>
                            </div>
                        </div>

                        <div className="border border-[#E6E8EB] hover:border-gray-800 transition-all rounded-2xl">
                            <div className="p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: COLORS.BLUE }}>Q2</span>
                                    <span>どのような企業情報を自動生成できますか？</span>
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    会社名、業種、従業員数、所在地、URL、代表者名、資金調達情報など、定義したスキーマに基づいて様々な情報を自動生成できます。Web検索を通じて最新のニュースや財務情報も取得可能です。
                                </p>
                            </div>
                        </div>

                        <div className="border border-[#E6E8EB] hover:border-gray-800 transition-all rounded-2xl">
                            <div className="p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: COLORS.BLUE }}>Q3</span>
                                    <span>データの精度はどのくらいですか？</span>
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    AIは最新のLLMを使用し、Web検索により公開情報をリアルタイムで取得します。ただし、生成されたデータは必ず確認いただくことを推奨します。重要な商談前には人手での検証をお願いします。
                                </p>
                            </div>
                        </div>

                        <div className="border border-[#E6E8EB] hover:border-gray-800 transition-all rounded-2xl hidden md:block">
                            <div className="p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: COLORS.BLUE }}>Q4</span>
                                    <span>既存のCRMからデータを移行できますか？</span>
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    CSV、Excel等の形式でデータをインポート可能です。また、主要なCRMツールとのAPI連携もサポートしています。詳細は営業チームにお問い合わせください。
                                </p>
                            </div>
                        </div>

                        <div className="border border-[#E6E8EB] hover:border-gray-800 transition-all rounded-2xl hidden md:block">
                            <div className="p-6">
                                <h3 className="font-bold mb-3 flex items-center gap-3">
                                    <span className="font-mono text-xs" style={{ color: COLORS.BLUE }}>Q5</span>
                                    <span>無料プランでできることは？</span>
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed pl-8">
                                    無料プランでは1,000レコードまで保存可能で、基本的なAI生成機能（1日10回まで）をお試しいただけます。機能を制限なく使用したい場合は、プロプラン以上をご検討ください。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-16 md:py-24 bg-white border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="bg-[#0000FF] text-white p-12 md:p-20 relative overflow-hidden border-2 border-blue-600 rounded-3xl">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-6xl font-bold tracking-tighter mb-6">
                                    AI駆動型CRMを<br />今すぐ始める
                                </h2>
                                <p className="text-blue-200 text-lg font-mono">
                                    無料トライアルで体験してみませんか？
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <button onClick={onEnter} className="px-8 py-4 bg-white text-blue-600 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg border-2 border-white rounded-full">
                                    始める
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 md:py-20 bg-white border-t border-gray-100 text-[#0A0B0D]">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight mb-2 font-mono">flowly</h3>
                            <p className="text-xs font-mono text-gray-500 uppercase">System Status: <span style={{ color: COLORS.GREEN }}>Operational</span></p>
                        </div>
                        <div className="flex gap-6 text-xs font-mono text-gray-400">
                            <a href="#" className="hover:text-black">Twitter</a>
                            <a href="#" className="hover:text-black">GitHub</a>
                            <a href="#" className="hover:text-black">Discord</a>
                            <span>© 2025 flowly Labs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
