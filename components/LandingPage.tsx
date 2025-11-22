'use client';

import React, { useState, useEffect } from 'react';
import { DataMap, BarChartGraphic, DotMatrix, PixelGrid, BlockStatusGrid } from './BaseGraphics';
import { IconChevronRight, IconCheck, IconX, IconBolt, IconDatabase, IconSearch, IconMessageCircle } from './Icons';
import { COLORS } from '../constants';

interface LandingPageProps {
    onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [scrolled, setScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => prev >= 3 ? 1 : prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-[#0A0B0D] selection:bg-blue-100">
            <PixelGrid />

            {/* --- Navigation --- */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-sm border-gray-200 py-3' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={onEnter}>
                        <div className="w-5 h-5 transition-transform duration-500" style={{ backgroundColor: COLORS.BLUE }}></div>
                        <span className="font-bold text-lg tracking-tight font-mono">BaseCRM</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
                        <a href="#concept" className="hover:text-blue-600 transition-colors">コンセプト</a>
                        <a href="#features" className="hover:text-blue-600 transition-colors">機能</a>
                        <a href="#pricing" className="hover:text-blue-600 transition-colors">料金</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onEnter}
                            className="px-5 py-2.5 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                            style={{ backgroundColor: COLORS.BLACK }}
                        >
                            アプリを起動
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="relative pt-40 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-[10px] font-mono font-bold tracking-widest mb-8 border border-gray-200">
                            <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                            AI_NATIVE_OS v2.1
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8 font-noto">
                            データ入力は、<br />
                            <span style={{ color: COLORS.BLUE }}>AIに任せる時代へ。</span>
                        </h1>

                        <p className="text-lg text-gray-500 max-w-lg leading-relaxed mb-10 font-medium">
                            BaseCRMは、ただの顧客管理ツールではありません。
                            スキーマを定義するだけで、AIが世界中からデータを収集、補完し、
                            あなたのビジネスを加速させるインテリジェントな基盤となります。
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

            {/* --- Comparison Section (Dark Mode) --- */}
            <section id="concept" className="bg-[#0A0B0D] text-white py-24 border-y-2 border-gray-800">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                            CRMの常識を変える
                        </h2>
                        <p className="text-gray-400 text-sm font-mono">
                            <span style={{ color: COLORS.PINK }}>OLD:</span> STATIC DATABASE  vs  <span style={{ color: COLORS.GREEN }}>NEW:</span> LIVING INTELLIGENCE
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 border-2 border-gray-800">
                        {/* Traditional */}
                        <div className="p-10 md:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-gray-800 bg-[#0F1012]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-gray-600"></div>
                                <h3 className="text-gray-400 font-mono text-sm font-bold uppercase tracking-wider">従来のCRM</h3>
                            </div>
                            <ul className="space-y-6 text-gray-300">
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 bg-gray-800 border border-gray-700 text-red-500 mt-0.5 flex-shrink-0"><IconX className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block text-white mb-1.5 font-bold">煩雑な手作業</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">顧客情報を一件ずつ手入力。または高額な外部サービスからのデータ移行が必須です。</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 bg-gray-800 border border-gray-700 text-red-500 mt-0.5 flex-shrink-0"><IconX className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block text-white mb-1.5 font-bold">古くなるデータ</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">入力直後から情報は古くなり、常に更新作業に追われてしまいます。</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 bg-gray-800 border border-gray-700 text-red-500 mt-0.5 flex-shrink-0"><IconX className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block text-white mb-1.5 font-bold">専門知識が必須</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">高度な分析を行うには、SQLなどの専門的な知識が欠かせません。</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* BaseCRM */}
                        <div className="p-10 md:p-16 bg-[#0A0B0D] relative">
                            {/* Blue accent bar */}
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: COLORS.BLUE }}></div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1" style={{ backgroundColor: COLORS.BLUE }}></div>
                                <h3 className="text-white font-mono text-sm font-bold uppercase tracking-wider">BaseCRM</h3>
                            </div>
                            <ul className="space-y-6 text-white">
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 border-2 border-green-600 bg-green-950/30 text-green-400 mt-0.5 flex-shrink-0"><IconCheck className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block mb-1.5 font-bold">AI自動生成</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">「東京のSaaS企業」と伝えるだけ。AIが必要なリストを自動で作成します。</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 border-2 border-green-600 bg-green-950/30 text-green-400 mt-0.5 flex-shrink-0"><IconCheck className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block mb-1.5 font-bold">リアルタイム情報取得</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">Web検索と連携し、最新の企業情報、ニュース、財務データを自動で取得・更新します。</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="p-1.5 border-2 border-green-600 bg-green-950/30 text-green-400 mt-0.5 flex-shrink-0"><IconCheck className="w-4 h-4" /></div>
                                    <div>
                                        <strong className="block mb-1.5 font-bold">会話形式で操作</strong>
                                        <span className="text-sm leading-relaxed text-gray-400">「売上10億円以上の企業は？」と聞くだけ。複雑なクエリも瞬時に実行されます。</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Workflow Section (Swiss Style Grid) --- */}
            <section className="py-32 bg-white border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter leading-[0.9]">
                            ワークフロー
                        </h2>
                        <div className="font-mono text-xs text-gray-400 text-right">
                            <div className="mb-1">ARCHITECTURE: PIPELINE</div>
                            <div className="flex items-center justify-end gap-2">
                                STATUS: <span className="text-green-500">READY</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 border-t-2 border-l-2 border-gray-200">
                        {/* Step 1 */}
                        <div className="group border-r-2 border-b-2 border-gray-200 p-10 relative hover:bg-gray-50 transition-colors min-h-[400px] flex flex-col justify-between">
                            <div>
                                <div className="text-6xl font-bold text-gray-100 mb-8 font-mono group-hover:text-blue-600 transition-colors">01</div>
                                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">スキーマ定義</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    データ構造、カラム型、ルールを定義。インテリジェンス層の設計図となります。
                                </p>
                            </div>
                            <div className="w-full h-px bg-gray-200 mt-auto relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full w-0 bg-blue-600 group-hover:w-full transition-all duration-700 ease-out"></div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="group border-r-2 border-b-2 border-gray-200 p-10 relative hover:bg-gray-50 transition-colors min-h-[400px] flex flex-col justify-between">
                            <div>
                                <div className="text-6xl font-bold text-gray-100 mb-8 font-mono group-hover:text-pink-500 transition-colors">02</div>
                                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">自動生成とエンリッチメント</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    エージェントがリアルタイムでWebをクロール。行を入力し、事実を検証し、即座にギャップを埋めます。
                                </p>
                            </div>
                            {/* Pixel Visual */}
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 bg-gray-100 group-hover:bg-pink-500 transition-colors duration-300"></div>
                                <div className="w-3 h-3 bg-gray-100 group-hover:bg-pink-500 transition-colors duration-300 delay-75"></div>
                                <div className="w-3 h-3 bg-gray-100 group-hover:bg-pink-500 transition-colors duration-300 delay-150"></div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="group border-r-2 border-b-2 border-gray-200 p-10 relative hover:bg-gray-50 transition-colors min-h-[400px] flex flex-col justify-between">
                            <div>
                                <div className="text-6xl font-bold text-gray-100 mb-8 font-mono group-hover:text-green-600 transition-colors">03</div>
                                <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">対話型クエリ</h3>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    SQLは不要。自然言語でデータをフィルタ、ソート、分析。データベースと対話しましょう。
                                </p>
                            </div>
                            <div className="font-mono text-xs text-gray-200 group-hover:text-green-600 transition-colors bg-black/0 group-hover:bg-black/5 inline-block px-2 py-1">
                                {`> SELECT * FROM FUTURE_`}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Ecosystem Cards --- */}
            <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter max-w-xl">
                            主な機能
                        </h2>
                        <p className="text-gray-500 max-w-md leading-relaxed font-mono text-xs md:text-sm bg-white p-4 border-2 border-gray-200 shadow-sm">
                            {'> STATUS: OPTIMIZED'}<br />
                            {'> MODULES: '}<span style={{ color: COLORS.PINK }}>ACTIVE</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "無限生成", en: "Infinite Generation", icon: <BarChartGraphic color={COLORS.PINK} />, desc: "見込み顧客リスト作成、市場調査、アイデア出し。AIが無限のリソースを提供します。" },
                            { title: "Web検索連動", en: "Live Web Access", icon: <div className="h-32 flex items-center justify-center"><div className="grid grid-cols-4 grid-rows-4 gap-1">{Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-3 h-3 bg-gray-200 hover:bg-green-500 transition-colors" style={{ animationDelay: `${i * 50}ms` }}></div>)}</div></div>, desc: "Google検索を通じて、常に最新の情報をデータベースに反映させます。" },
                            { title: "スケーラビリティ", en: "High Scalability", icon: <div className="h-32 flex items-center justify-center"><DotMatrix /></div>, desc: "数万行のデータも遅延なく処理。ブラウザ上で動作する軽量設計。" },
                            { title: "対話型分析", en: "Conversational Analytics", icon: <div className="h-32 flex items-center justify-center font-mono text-2xl font-bold text-gray-300">_QUERY</div>, desc: "「先月のトップパフォーマーは？」と聞くだけで、複雑なフィルタリングを実行。" }
                        ].map((card, i) => (
                            <div key={i} className="group bg-white p-8 border-2 border-gray-200 hover:border-gray-800 transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-blue-600 transition-colors"></div>
                                <div className="h-32 mb-6 border-b border-gray-50 pb-4 overflow-hidden">
                                    {card.icon}
                                </div>
                                <div className="mb-2">
                                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{card.title}</h3>
                                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{card.en}</p>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium mt-4">
                                    {card.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Intelligence Loop --- */}
            <section className="py-32 bg-white relative overflow-hidden border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-10 leading-tight">
                                AIが考える<br />データベース
                            </h2>

                            <div className="space-y-8">
                                {/* Step 1 */}
                                <div>
                                    <div className="text-xs font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: COLORS.PINK }}>01 / データ生成</div>
                                    <h3 className="text-lg font-bold mb-2">「Fintech企業50社」と指示</h3>
                                    <p className="text-gray-500 leading-relaxed">AIが条件を理解し、該当する企業リストを自動で作成。手作業ゼロで必要なデータが揃います。</p>
                                </div>

                                {/* Step 2 */}
                                <div>
                                    <div className="text-xs font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: COLORS.GREEN }}>02 / 情報収集</div>
                                    <h3 className="text-lg font-bold mb-2">Web検索で最新情報を取得</h3>
                                    <p className="text-gray-500 leading-relaxed">資金調達ラウンド、経営陣の異動、最新ニュースなど、常に最新の情報を自動で補完します。</p>
                                </div>

                                {/* Step 3 */}
                                <div>
                                    <div className="text-xs font-mono font-bold mb-2 uppercase tracking-wider" style={{ color: COLORS.BLUE }}>03 / データ分析</div>
                                    <h3 className="text-lg font-bold mb-2">「成長性の高い企業は？」と質問</h3>
                                    <p className="text-gray-500 leading-relaxed">複数の条件を組み合わせた高度なフィルタリングも、自然な会話で瞬時に実行されます。</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side: Data Block Visual */}
                        <div className="relative h-[500px] bg-gray-50 border-2 border-gray-200 p-10 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${COLORS.BLUE} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                            <BlockStatusGrid />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Pricing Section --- */}
            <section id="pricing" className="py-32 border-t border-gray-200 bg-[#0A0B0D] text-white">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">
                            料金プラン
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl font-light">
                            チームの規模に合わせて拡張。隠れたコストはありません。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Plan 1 */}
                        <div className="bg-white/5 border-2 border-white/10 p-8 hover:bg-white/10 transition-all">
                            <div className="text-gray-400 font-mono text-xs font-bold uppercase mb-4">スターター</div>
                            <div className="text-4xl font-bold mb-2">無料</div>
                            <p className="text-gray-400 text-sm mb-8">個人利用、PoC向け。</p>
                            <ul className="space-y-3 mb-8 text-sm text-gray-300 font-mono">
                                <li>[x] 1,000 レコード</li>
                                <li>[x] 基本AI生成 (10回/日)</li>
                                <li>[ ] Webエンリッチ</li>
                            </ul>
                            <button onClick={onEnter} className="w-full py-3 border-2 border-white/20 hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase">始める</button>
                        </div>

                        {/* Plan 2 */}
                        <div className="border-2 p-8 transform md:-translate-y-4 shadow-2xl relative" style={{ backgroundColor: COLORS.BLUE, borderColor: COLORS.CERULEAN }}>
                            <div className="absolute top-0 right-0 text-black text-[9px] font-bold uppercase px-2 py-1" style={{ backgroundColor: COLORS.GREEN }}>推奨</div>
                            <div className="text-white/90 font-mono text-xs font-bold uppercase mb-4">プロ</div>
                            <div className="text-4xl font-bold mb-2">¥2,900<span className="text-lg font-normal opacity-50">/月</span></div>
                            <p className="text-blue-100 text-sm mb-8">成長中のスタートアップ向け。</p>
                            <ul className="space-y-3 mb-8 text-sm text-white font-mono">
                                <li>[x] 無制限のレコード</li>
                                <li>[x] Webエンリッチメント</li>
                                <li>[x] 高度なチャット分析</li>
                                <li>[x] データエクスポート</li>
                            </ul>
                            <button onClick={onEnter} className="w-full py-3 bg-white hover:bg-gray-100 transition-colors text-xs font-bold uppercase" style={{ color: COLORS.BLUE }}>トライアル開始</button>
                        </div>

                        {/* Plan 3 */}
                        <div className="bg-white/5 border-2 border-white/10 p-8 hover:bg-white/10 transition-all">
                            <div className="text-pink-400 font-mono text-xs font-bold uppercase mb-4">エンタープライズ</div>
                            <div className="text-4xl font-bold mb-2">要相談</div>
                            <p className="text-gray-400 text-sm mb-8">大規模組織、セキュリティ重視。</p>
                            <ul className="space-y-3 mb-8 text-sm text-gray-300 font-mono">
                                <li>[x] 専用インスタンス</li>
                                <li>[x] SSO & 監査ログ</li>
                                <li>[x] カスタムAIモデル</li>
                            </ul>
                            <button onClick={onEnter} className="w-full py-3 border-2 border-white/20 hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase">お問い合わせ</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA Section (New) --- */}
            <section className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="bg-[#0000FF] text-white p-12 md:p-20 relative overflow-hidden border-2 border-blue-600">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                                    AI駆動型CRMを<br />今すぐ始める
                                </h2>
                                <p className="text-blue-200 text-lg font-mono">
                                    無料トライアルで体験してみませんか？
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                <button onClick={onEnter} className="px-8 py-4 bg-white text-blue-600 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg border-2 border-white">
                                    始める
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-20 bg-white border-t border-gray-100 text-[#0A0B0D]">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight mb-2 font-mono">BaseCRM</h3>
                            <p className="text-xs font-mono text-gray-500 uppercase">System Status: <span style={{ color: COLORS.GREEN }}>Operational</span></p>
                        </div>
                        <div className="flex gap-6 text-xs font-mono text-gray-400">
                            <a href="#" className="hover:text-black">Twitter</a>
                            <a href="#" className="hover:text-black">GitHub</a>
                            <a href="#" className="hover:text-black">Discord</a>
                            <span>© 2024 BaseCRM Labs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
