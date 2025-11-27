import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art efficiency graphic - Horizontal / Light Theme
 * Used for "90% Reduction" stats card
 */
export const EfficiencyGraphic: React.FC = () => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Animate bar growing
        const interval = setInterval(() => {
            setWidth(prev => (prev >= 100 ? 0 : prev + 5));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex items-center px-6 font-mono text-[10px] leading-tight overflow-hidden bg-gray-50 text-gray-800">
            <div className="w-full">
                <div className="flex justify-between mb-2">
                    <span className="font-bold">EFFICIENCY_METRIC</span>
                    <span className="font-bold" style={{ color: COLORS.BLUE }}>+{Math.min(width * 5, 500)}%</span>
                </div>

                <div className="relative h-6 w-full bg-gray-200 rounded-sm overflow-hidden border border-gray-300">
                    {/* Background Grid */}
                    <div className="absolute inset-0 grid grid-cols-10 opacity-20">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="border-r border-gray-400 h-full"></div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="h-full transition-all duration-100 ease-linear relative"
                        style={{ width: `${width}%`, backgroundColor: COLORS.BLUE }}
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50"></div>
                    </div>
                </div>

                <div className="flex justify-between mt-1 text-[8px] text-gray-400">
                    <span>0h</span>
                    <span>TIME SAVED</span>
                    <span>100h</span>
                </div>
            </div>
        </div>
    );
};
