import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art AI generation process visualization with animated progress bar
 * Shows web search and data enrichment steps
 */
export const GenerationGraphic: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev + 1) % 11);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const getBar = () => '█'.repeat(progress) + '░'.repeat(10 - progress);

    return (
        <div className="w-full h-48 flex items-center justify-center font-mono text-[9px] leading-tight">
            <div className="relative">
                <div className="text-center" style={{ color: COLORS.PINK }}>
                    <div>╔═══════════════════╗</div>
                    <div>║  AI GENERATION    ║</div>
                    <div>╠═══════════════════╣</div>
                    <div>║                   ║</div>
                    <div>║  [{getBar()}] {progress * 10}% ║</div>
                    <div>║                   ║</div>
                    <div>║  Processing...    ║</div>
                    <div>║  {progress >= 5 ? '✓' : '○'} Web Search      ║</div>
                    <div>║  {progress >= 8 ? '✓' : '○'} Data Enrichment║</div>
                    <div>║                   ║</div>
                    <div>╚═══════════════════╝</div>
                </div>
            </div>
        </div>
    );
};
