import React from 'react';
import { COLORS } from '@/config/constants';

/**
 * Three-column concept section explaining core value props
 * AI Generation, Web Search, Natural Language Analysis
 */
export const LandingConcept: React.FC = () => {
    return (
        <section id="concept" className="py-16 md:py-24 lg:py-32 bg-gray-50 border-t border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 md:mb-16">
                        <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4">What is flowly?</div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8 leading-tight">
                            手入力から自動生成へ、<br />
                            CRMの<span style={{ color: COLORS.BLUE }}>パラダイムシフト</span>
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            <span className="md:hidden">従来のCRMは手入力が必須でした。flowlyはAIが自動生成し、営業に専念できます。</span>
                            <span className="hidden md:inline">従来のCRMは膨大な手入力作業が必要でした。flowlyはAIがリード情報を自動生成し、
                                Web検索で最新データを収集。営業チームは戦略立案と商談に専念できます。</span>
                        </p>
                    </div>

                    {/* Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1: AI Generation */}
                        <div className="bg-white border-2 border-gray-800 p-6 md:p-10 hover:bg-gray-50 transition-all group relative rounded-2xl">


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
                        <div className="bg-white border-2 border-gray-800 p-6 md:p-10 hover:bg-gray-50 transition-all group relative rounded-2xl">


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
                        <div className="bg-white border-2 border-gray-800 p-6 md:p-10 hover:bg-gray-50 transition-all group relative rounded-2xl">


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
    );
};
