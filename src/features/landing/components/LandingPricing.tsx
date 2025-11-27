import React from 'react';
import { COLORS } from '@/config/constants';

interface LandingPricingProps {
    onEnter: () => void;
}

/**
 * Pricing section with 3 tiers
 * Free, Pro (recommended), Enterprise
 */
export const LandingPricing: React.FC<LandingPricingProps> = ({ onEnter }) => {
    return (
        <section id="pricing" className="py-20 md:py-32 border-t border-gray-200 bg-[#0A0B0D] text-white">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="mb-10 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">
                        料金プラン
                    </h2>
                    <p className="text-base md:text-lg text-gray-400 max-w-2xl font-light">
                        チームの規模に合わせて拡張。隠れたコストはありません。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Plan 1 */}
                    <div className="bg-white/5 border-2 border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all rounded-3xl">
                        <div className="text-gray-400 font-mono text-xs font-bold uppercase mb-4">スターター</div>
                        <div className="text-4xl font-bold mb-2">無料</div>
                        <p className="text-gray-400 text-sm mb-8">個人利用、PoC向け。</p>
                        <ul className="space-y-3 mb-8 text-sm text-gray-300 font-mono">
                            <li>[x] 1,000 レコード</li>
                            <li>[x] 基本AI生成 (10回/日)</li>
                            <li>[ ] Webエンリッチ</li>
                        </ul>
                        <button onClick={onEnter} className="w-full py-3 border-2 border-white/20 hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase rounded-full">始める</button>
                    </div>

                    {/* Plan 2 */}
                    <div className="border-2 p-6 md:p-8 transform md:-translate-y-4 shadow-2xl relative rounded-3xl" style={{ backgroundColor: COLORS.BLUE, borderColor: COLORS.CERULEAN }}>
                        <div className="absolute top-0 right-0 text-black text-[9px] font-bold uppercase px-2 py-1 rounded-bl-xl rounded-tr-2xl" style={{ backgroundColor: COLORS.GREEN }}>推奨</div>
                        <div className="text-white/90 font-mono text-xs font-bold uppercase mb-4">プロ</div>
                        <div className="text-4xl font-bold mb-2">¥2,900<span className="text-lg font-normal opacity-50">/月</span></div>
                        <p className="text-blue-100 text-sm mb-8">成長中のスタートアップ向け。</p>
                        <ul className="space-y-3 mb-8 text-sm text-white font-mono">
                            <li>[x] 無制限のレコード</li>
                            <li>[x] Webエンリッチメント</li>
                            <li>[x] 高度なチャット分析</li>
                            <li>[x] データエクスポート</li>
                        </ul>
                        <button onClick={onEnter} className="w-full py-3 bg-white hover:bg-gray-100 transition-colors text-xs font-bold uppercase rounded-full" style={{ color: COLORS.BLUE }}>トライアル開始</button>
                    </div>

                    {/* Plan 3 */}
                    <div className="bg-white/5 border-2 border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all rounded-3xl">
                        <div className="text-pink-400 font-mono text-xs font-bold uppercase mb-4">エンタープライズ</div>
                        <div className="text-4xl font-bold mb-2">要相談</div>
                        <p className="text-gray-400 text-sm mb-8">大規模組織、セキュリティ重視。</p>
                        <ul className="space-y-3 mb-8 text-sm text-gray-300 font-mono">
                            <li>[x] 専用インスタンス</li>
                            <li>[x] SSO & 監査ログ</li>
                            <li>[x] カスタムAIモデル</li>
                        </ul>
                        <button onClick={onEnter} className="w-full py-3 border-2 border-white/20 hover:bg-white hover:text-black transition-colors text-xs font-bold uppercase rounded-full">お問い合わせ</button>
                    </div>
                </div>
            </div>
        </section>
    );
};
