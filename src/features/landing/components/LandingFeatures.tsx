import React from 'react';
import { PhoneGraphic, DiamondGraphic, HexagonGraphic, WalletGraphic } from '@/ui/graphics';
import { COLORS } from '@/config/constants';

/**
 * Enterprise features grid - 4 columns
 * Scalability, Export, API, Security
 */
export const LandingFeatures: React.FC = () => {
    return (
        <section className="py-16 md:py-24 bg-white border-t border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <div className="mb-8 md:mb-16 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                        エンタープライズ<br className="md:hidden" />対応の機能
                    </h2>
                    <p className="text-gray-500 text-sm font-mono">ENTERPRISE READY</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Feature 1: Scalability - Green */}
                    <div className="bg-white border-2 p-5 md:p-6 hover:shadow-xl transition-all relative overflow-hidden group rounded-2xl" style={{ borderColor: COLORS.GREEN }}>
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.GREEN }}></div>
                        <div className="mb-2 md:mb-4 relative z-10">
                            <PhoneGraphic />
                            <h3 className="text-lg font-bold mb-2 mt-2 md:mt-4">大規模データ処理</h3>
                            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.GREEN }}>High Performance</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed hidden md:block">
                            数万件のリードデータも高速処理。
                            ストレスフリーな操作性を実現します。
                        </p>
                    </div>

                    {/* Feature 2: Export - Pink */}
                    <div className="bg-white border-2 p-5 md:p-6 hover:shadow-xl transition-all relative overflow-hidden group rounded-2xl" style={{ borderColor: COLORS.PINK }}>
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.PINK }}></div>
                        <div className="mb-2 md:mb-4 relative z-10">
                            <DiamondGraphic />
                            <h3 className="text-lg font-bold mb-2 mt-2 md:mt-4">柔軟なデータ連携</h3>
                            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.PINK }}>Data Export</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed hidden md:block">
                            CSV、JSON、Excel形式でのエクスポートに対応。
                            既存システムとのシームレスな連携が可能です。
                        </p>
                    </div>

                    {/* Feature 3: API - Tan */}
                    <div className="bg-white border-2 p-5 md:p-6 hover:shadow-xl transition-all relative overflow-hidden group rounded-2xl" style={{ borderColor: COLORS.TAN }}>
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.TAN }}></div>
                        <div className="mb-2 md:mb-4 relative z-10">
                            <HexagonGraphic />
                            <h3 className="text-lg font-bold mb-2 mt-2 md:mt-4">RESTful API</h3>
                            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.TAN }}>Developer Friendly</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed hidden md:block">
                            充実したAPI機能で、既存の業務システムや
                            マーケティングツールと統合可能です。
                        </p>
                    </div>

                    {/* Feature 4: Security - Blue */}
                    <div className="bg-white border-2 p-5 md:p-6 hover:shadow-xl transition-all relative overflow-hidden group rounded-2xl" style={{ borderColor: COLORS.BLUE }}>
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{ backgroundColor: COLORS.BLUE }}></div>
                        <div className="mb-2 md:mb-4 relative z-10">
                            <WalletGraphic />
                            <h3 className="text-lg font-bold mb-2 mt-2 md:mt-4">エンタープライズセキュリティ</h3>
                            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: COLORS.BLUE }}>Secure</p>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed hidden md:block">
                            SOC 2準拠のセキュリティ基準。
                            重要な顧客データを安全に管理します。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
