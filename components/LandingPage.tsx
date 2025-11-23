
'use client';

import React, { useState, useEffect } from 'react';
import { DataMap, BarChartGraphic, DotMatrix, PixelGrid, BlockStatusGrid, PhoneGraphic, DiamondGraphic, HexagonGraphic, WalletGraphic, SchemaGraphic, GenerationGraphic } from './BaseGraphics';
import { IconChevronRight, IconCheck, IconX, IconBolt, IconDatabase, IconSearch, IconMessageCircle, IconSparkles } from './Icons';
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
                            className="px-4 py-2 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors border-2 border-gray-200"
                        >
                            ログイン
                        </button>
                        <button
                            onClick={onEnter}
                            className="px-4 py-2 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg"
                            style={{ backgroundColor: COLORS.BLUE }}
                        >
                            無料で始める
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

            {/* --- What is flowly? New Vertical Layout --- */}
            <section id="concept" className="py-24 md:py-32 bg-gray-50 border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4">What is flowly?</div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                                手入力から自動生成へ、<br />
                                CRMの<span style={{ color: COLORS.BLUE }}>パラダイムシフト</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                                従来のCRMは膨大な手入力作業が必要でした。flowlyはAIがリード情報を自動生成し、
                                Web検索で最新データを収集。営業チームは戦略立案と商談に専念できます。
                            </p>
                        </div>

                        {/* Three Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Card 1: AI Generation */}
                            <div className="bg-white border-2 border-gray-800 p-10 hover:bg-gray-50 transition-all group relative">
                                {/* Terminal-style corner brackets */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-800"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-800"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-800"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-800"></div>

                                <div className="font-mono text-xs text-gray-400 mb-4">[01]</div>
                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-4 font-mono text-2xl font-bold text-gray-300">*</div>
                                    <h3 className="text-xl font-bold mb-2">AIによる自動生成</h3>
                                    <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">AI Generation</p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    「東京のFintech企業50社」と指示するだけで、AIが該当する企業リストを自動生成。
                                    手作業では数日かかる作業が数分で完了します。
                                </p>
                            </div>

                            {/* Card 2: Web Search */}
                            <div className="bg-white border-2 border-gray-800 p-10 hover:bg-gray-50 transition-all group relative">
                                {/* Terminal-style corner brackets */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-800"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-800"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-800"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-800"></div>

                                <div className="font-mono text-xs mb-4" style={{ color: COLORS.BLUE }}>[02]</div>
                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-4 font-mono text-2xl font-bold text-gray-300">@</div>
                                    <h3 className="text-xl font-bold mb-2">リアルタイムWeb検索</h3>
                                    <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Live Web Search</p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    企業の最新ニュース、財務情報、採用状況まで。AIがWeb検索を通じて
                                    常に最新の情報をデータベースに反映させます。
                                </p>
                            </div>

                            {/* Card 3: Conversational */}
                            <div className="bg-white border-2 border-gray-800 p-10 hover:bg-gray-50 transition-all group relative">
                                {/* Terminal-style corner brackets */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-800"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-800"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-800"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-800"></div>

                                <div className="font-mono text-xs text-gray-400 mb-4">[03]</div>
                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-4 font-mono text-2xl font-bold text-gray-300">{`>`}</div>
                                    <h3 className="text-xl font-bold mb-2">自然言語での分析</h3>
                                    <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Natural Language Query</p>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    「成長率の高い企業は？」と質問するだけ。SQL不要で複雑なデータ分析が可能。
                                    経営判断に必要なインサイトを即座に取得できます。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- How It Works (Alternating Sections) --- */}
            <section className="py-24 md:py-32 bg-white border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="mb-20 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                            3ステップで始める
                        </h2>
                        <p className="text-gray-500 font-mono text-sm">SIMPLE WORKFLOW</p>
                    </div>

                    {/* Step 1: Image LEFT, Text RIGHT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 items-center">
                        {/* Left: Visual */}
                        <div className="order-2 lg:order-1">
                            <div className="border-2 bg-white p-12 min-h-[350px] flex items-center justify-center relative" style={{ borderColor: COLORS.BLUE }}>
                                <div className="absolute top-4 left-4 text-[120px] font-bold font-mono leading-none opacity-5" style={{ color: COLORS.BLUE }}>01</div>
                                <div className="relative z-10">
                                    <SchemaGraphic />
                                </div>
                            </div>
                        </div>
                        {/* Right: Text */}
                        <div className="order-1 lg:order-2">
                            <div className="text-xs font-mono font-bold mb-3 uppercase tracking-wider" style={{ color: COLORS.BLUE }}>Step 01</div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                                データ構造を設計
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                まず、必要なデータ項目とその型を定義します。「会社名」「業種」「従業員数」「URL」など、
                                ビジネスに必要な情報を指定。これがAIのデータ生成の設計図となります。
                            </p>
                            <div className="border-l-2 pl-4" style={{ borderColor: COLORS.BLUE }}>
                                <p className="text-sm font-mono text-gray-500">
                                    柔軟なスキーマ設計により、あらゆる業種・用途に対応可能
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Text LEFT, Image RIGHT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20 items-center">
                        {/* Left: Text */}
                        <div>
                            <div className="text-xs font-mono font-bold mb-3 uppercase tracking-wider" style={{ color: COLORS.PINK }}>Step 02</div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                                AIが自動でリード生成
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                「東京のFintech企業50社」「年商10億円以上のSaaS企業」など、
                                条件を指定するだけ。AIが該当企業を自動で抽出し、Web検索を通じて
                                最新の企業情報、ニュース、財務データまで収集します。
                            </p>
                            <div className="border-l-2 pl-4" style={{ borderColor: COLORS.PINK }}>
                                <p className="text-sm font-mono text-gray-500">
                                    数日かかるリサーチ作業が、数分で完了
                                </p>
                            </div>
                        </div>
                        {/* Right: Visual */}
                        <div>
                            <div className="border-2 bg-white p-12 min-h-[350px] flex items-center justify-center relative" style={{ borderColor: COLORS.PINK }}>
                                <div className="absolute top-4 right-4 text-[120px] font-bold font-mono leading-none opacity-5" style={{ color: COLORS.PINK }}>02</div>
                                <div className="relative z-10">
                                    <GenerationGraphic />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Image LEFT, Text RIGHT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left: Visual */}
                        <div className="order-2 lg:order-1">
                            <div className="border-2 border-gray-200 bg-gray-50 p-12 min-h-[300px] flex items-center justify-center relative">
                                <div className="absolute top-4 left-4 text-[120px] font-bold text-gray-100 font-mono leading-none">03</div>
                                <div className="relative z-10 font-mono text-sm text-gray-400">
                                    <div className="mb-2">{`> SELECT * FROM companies`}</div>
                                    <div className="mb-2">{`> WHERE revenue > 10M`}</div>
                                    <div>{`> ORDER BY growth_rate DESC_`}</div>
                                </div>
                            </div>
                        </div>
                        {/* Right: Text */}
                        <div className="order-1 lg:order-2">
                            <div className="text-xs font-mono font-bold mb-3 uppercase tracking-wider" style={{ color: COLORS.GREEN }}>Step 03</div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
                                対話形式でデータ分析
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                「成長率の高い企業トップ10は？」「先月追加されたリードで商談確度の高いものは？」
                                など、自然言語で質問するだけ。複雑なSQLクエリは不要です。
                                AIが瞬時に分析し、ビジネスインサイトを提供します。
                            </p>
                            <div className="border-l-2 pl-4" style={{ borderColor: COLORS.GREEN }}>
                                <p className="text-sm font-mono text-gray-500">
                                    データアナリストがいなくても、高度な分析が可能
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Advanced Features (4-Column) --- */}
            <section className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                            エンタープライズ対応の機能
                        </h2>
                        <p className="text-gray-500 text-sm font-mono">ENTERPRISE READY</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1: Scalability - Green */}
                        <div className="bg-white border-2 p-6 hover:shadow-xl transition-all relative overflow-hidden group" style={{ borderColor: COLORS.GREEN }}>
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.GREEN }}></div>
                            <div className="mb-4 relative z-10">
                                <PhoneGraphic />
                                <h3 className="text-lg font-bold mb-2 mt-4">大規模データ処理</h3>
                                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.GREEN }}>High Performance</p>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                数万件のリードデータも高速処理。
                                ストレスフリーな操作性を実現します。
                            </p>
                        </div>

                        {/* Feature 2: Export - Pink */}
                        <div className="bg-white border-2 p-6 hover:shadow-xl transition-all relative overflow-hidden group" style={{ borderColor: COLORS.PINK }}>
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.PINK }}></div>
                            <div className="mb-4 relative z-10">
                                <DiamondGraphic />
                                <h3 className="text-lg font-bold mb-2 mt-4">柔軟なデータ連携</h3>
                                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.PINK }}>Data Export</p>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                CSV、JSON、Excel形式でのエクスポートに対応。
                                既存システムとのシームレスな連携が可能です。
                            </p>
                        </div>

                        {/* Feature 3: API - Tan */}
                        <div className="bg-white border-2 p-6 hover:shadow-xl transition-all relative overflow-hidden group" style={{ borderColor: COLORS.TAN }}>
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.TAN }}></div>
                            <div className="mb-4 relative z-10">
                                <HexagonGraphic />
                                <h3 className="text-lg font-bold mb-2 mt-4">RESTful API</h3>
                                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.TAN }}>Developer Friendly</p>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                充実したAPI機能で、既存の業務システムや
                                マーケティングツールと統合可能です。
                            </p>
                        </div>

                        {/* Feature 4: Security - Blue */}
                        <div className="bg-white border-2 p-6 hover:shadow-xl transition-all relative overflow-hidden group" style={{ borderColor: COLORS.BLUE }}>
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.BLUE }}></div>
                            <div className="mb-4 relative z-10">
                                <WalletGraphic />
                                <h3 className="text-lg font-bold mb-2 mt-4">エンタープライズセキュリティ</h3>
                                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.BLUE }}>Secure</p>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                SOC 2準拠のセキュリティ基準。
                                重要な顧客データを安全に管理します。
                            </p>
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

            {/* --- Q&A Section --- */}
            <section className="py-24 bg-white border-t border-gray-200">
                <div className="max-w-[1000px] mx-auto px-6 md:px-12">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                            よくある質問
                        </h2>
                        <p className="text-gray-500 text-sm font-mono">FAQ</p>
                    </div>

                    <div className="space-y-4">
                        {/* Q1 */}
                        <div className="border-2 border-gray-200 hover:border-gray-800 transition-all">
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

                        {/* Q2 */}
                        <div className="border-2 border-gray-200 hover:border-gray-800 transition-all">
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

                        {/* Q3 */}
                        <div className="border-2 border-gray-200 hover:border-gray-800 transition-all">
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

                        {/* Q4 */}
                        <div className="border-2 border-gray-200 hover:border-gray-800 transition-all">
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

                        {/* Q5 */}
                        <div className="border-2 border-gray-200 hover:border-gray-800 transition-all">
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
                            <h3 className="text-2xl font-bold tracking-tight mb-2 font-mono">flowly</h3>
                            <p className="text-xs font-mono text-gray-500 uppercase">System Status: <span style={{ color: COLORS.GREEN }}>Operational</span></p>
                        </div>
                        <div className="flex gap-6 text-xs font-mono text-gray-400">
                            <a href="#" className="hover:text-black">Twitter</a>
                            <a href="#" className="hover:text-black">GitHub</a>
                            <a href="#" className="hover:text-black">Discord</a>
                            <span>© 2024 flowly Labs</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
