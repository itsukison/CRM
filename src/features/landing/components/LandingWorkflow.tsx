import React from 'react';
import { SchemaGraphic, GenerationGraphic } from '@/ui/graphics';
import { COLORS } from '@/config/constants';

/**
 * Three-step workflow visualization
 * Shows how the product works with alternating layout
 */
export const LandingWorkflow: React.FC = () => {
    return (
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
    );
};
