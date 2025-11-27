'use client';

import React, { useState, useEffect } from 'react';
import { PixelGrid } from '@/ui/graphics';
import { COLORS } from '@/config/constants';
import { LandingHero } from './components/LandingHero';
import { LandingConcept } from './components/LandingConcept';
import { LandingWorkflow } from './components/LandingWorkflow';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingPricing } from './components/LandingPricing';
import { LandingTestimonials } from './components/LandingTestimonials';
import { LandingFAQ } from './components/LandingFAQ';
import { LandingFooter } from './components/LandingFooter';

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
            <LandingTestimonials />
            <LandingPricing onEnter={onEnter} />
            <LandingFAQ />

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
                                <button 
    onClick={onEnter} 
    className="px-4 py-2 md:px-8 md:py-4 bg-white text-blue-600 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg border-2 border-white rounded-2xl md:rounded-full"
>
    始める
</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};
