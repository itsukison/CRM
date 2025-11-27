'use client';

import React from 'react';
import { DataStreamGraphic } from '@/ui/graphics/DataStreamGraphic';
import { EfficiencyGraphic } from '@/ui/graphics/EfficiencyGraphic';

export const LandingTestimonials: React.FC = () => {
    return (
        <section className="py-16 md:py-24 border-t border-gray-200 bg-[#F5F5F7]">
            {/* Increased max-width from 1100px to 1280px for a wider look */}
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
                <div className="mb-8 md:mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-[#0A0B0D]">
                        業界のリーダーたちが<span className="font-mono mx-2">flowly</span>を選ぶ理由
                    </h2>
                    <p className="text-gray-500 text-xs font-mono">VOICE OF CUSTOMERS</p>
                </div>

                <div className="space-y-8">
                    {/* Row 1: 1/2 Testimonial, 1/2 Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Testimonial 1 (Araki) - HIDDEN ON MOBILE */}
                        <div className="hidden md:flex bg-white p-8 rounded-2xl border border-[#E6E8EB] shadow-sm hover:shadow-md transition-all flex-col h-full">
                            <div className="mb-4">
                                <p className="text-[#0A0B0D] text-sm leading-relaxed font-medium">
                                    "過去10年分の名刺データがただの『紙の山』になっていました。flowly導入後、眠っていた5,000件のリードが可視化され、初月だけで休眠顧客からの商談が15件発生。ツール一つでこれほど機会損失を防げるとは驚きです。"
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-[#0A0B0D]">荒木 俊介</div>
                                    <div className="text-[10px] text-gray-500 font-mono">港都トレーディング株式会社 営業部長</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card 1 (Data Stream) - VISIBLE ON MOBILE (2nd Card) */}
                        <div className="bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden group">
                            <div className="w-full h-24 bg-gray-50 rounded-lg relative overflow-hidden mb-4 border border-gray-100 shadow-inner">
                                <DataStreamGraphic />
                            </div>
                            <div className="mt-auto">
                                <div className="text-3xl md:text-4xl font-bold tracking-tighter mb-1 text-[#0A0B0D]">
                                    1,200<span className="text-xl font-normal text-gray-500">社以上</span>
                                </div>
                                <p className="text-gray-500 text-xs font-mono">の上場・成長企業が導入</p>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: 1/3 Testimonial, 1/3 Testimonial, 1/3 Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 2 (Nagai) - VISIBLE ON MOBILE (3rd Card) */}
                        <div className="bg-white p-6 rounded-2xl border border-[#E6E8EB] shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <p className="text-[#0A0B0D] text-xs md:text-sm leading-relaxed font-medium">
                                    "企業HPから手動でリストを作る作業がゼロに。ターゲット企業の条件を入れるだけで、決裁者情報付きのリストが自動生成され、インサイドセールスの架電数が3倍になりました。"
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-[#0A0B0D]">永井 玲奈</div>
                                    <div className="text-[10px] text-gray-500 font-mono">Next Innovation 株式会社 / ISチーム</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 (Ogiwara) - VISIBLE ON MOBILE (4th Card) */}
                        <div className="bg-white p-6 rounded-2xl border border-[#E6E8EB] shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <p className="text-[#0A0B0D] text-xs md:text-sm leading-relaxed font-medium">
                                    "海外製CRMは多機能すぎて現場が疲弊していましたが、flowlyは直感的でマニュアル不要でした。50代のベテラン営業員も導入初日から『これなら使える』と喜んでいます。"
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-[#0A0B0D]">荻原 健吾</div>
                                    <div className="text-[10px] text-gray-500 font-mono">大和精密工業株式会社 DX推進室</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card 2 (Efficiency Graph) - HIDDEN ON MOBILE (5th Card) */}
                        <div className="hidden md:flex bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all flex-col h-full relative overflow-hidden group">
                            <div className="w-full h-24 bg-gray-50 rounded-lg relative overflow-hidden mb-4 border border-gray-100 shadow-inner">
                                <EfficiencyGraphic />
                            </div>
                            <div className="mt-auto">
                                <div className="text-3xl md:text-4xl font-bold tracking-tighter mb-1 text-[#0A0B0D]">
                                    90%<span className="text-xl font-normal text-gray-500">削減</span>
                                </div>
                                <p className="text-gray-500 text-xs font-mono">データ入力・管理コスト</p>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: 1/3 Testimonial, 2/3 Testimonial - HIDDEN ON MOBILE (Cards 6 & 7) */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 4 (Sakamoto) */}
                        <div className="bg-white p-6 rounded-2xl border border-[#E6E8EB] shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                            <div className="mb-4">
                                <p className="text-[#0A0B0D] text-xs md:text-sm leading-relaxed font-medium">
                                    "現場から帰社してPCを開く作業がなくなりました。商談直後の移動中にスマホの音声入力で報告完了。残業時間が月20時間減り、メンバーの顔色が明るくなりました。"
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-700"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-[#0A0B0D]">坂本 龍之介</div>
                                    <div className="text-[10px] text-gray-500 font-mono">坂本建工株式会社 エリアマネージャー</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 5 (Kanda) */}
                        <div className="bg-white p-8 rounded-2xl border border-[#E6E8EB] shadow-sm hover:shadow-md transition-all flex flex-col h-full md:col-span-2">
                            <div className="mb-4">
                                <p className="text-[#0A0B0D] text-sm leading-relaxed font-medium">
                                    "レガシーシステムからのリプレイスにあたり、最も懸念していたのがデータ移行と独自商流への対応でした。flowlyはスキーマ設計が柔軟で、弊社の複雑な代理店モデルもノーコードで再現できました。APIのレスポンスも非常に高速で、月間数百万レコードを扱う環境でもストレスなく動作しています。CTOとして自信を持って推薦できます。"
                                </p>
                            </div>
                            <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-[#0A0B0D]">神田 正輝</div>
                                    <div className="text-[10px] text-gray-500 font-mono">株式会社グローバル・ロジスティクス 取締役CTO</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};