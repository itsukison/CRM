import React from 'react';
import { COLORS } from '@/config/constants';

interface BarChartGraphicProps {
    color?: string;
}

/**
 * Vertical bar chart graphic with pixelated style
 * Displays 16 bars with random heights and hover effects
 */
export const BarChartGraphic: React.FC<BarChartGraphicProps> = ({ color = COLORS.BLUE }) => {
    return (
        <div className="flex items-end gap-1 h-32 w-full justify-center opacity-80">
            {Array.from({ length: 16 }).map((_, i) => {
                const h = 20 + Math.random() * 80;
                return (
                    <div
                        key={i}
                        className="w-1.5 transition-all duration-500 hover:h-full relative"
                        style={{
                            height: `${h}%`,
                            backgroundColor: i % 4 === 0 ? color : COLORS.GRAY_15
                        }}
                    >
                        <div className="absolute -top-1 left-0 w-full h-1 bg-black/10"></div>
                    </div>
                );
            })}
        </div>
    );
};
