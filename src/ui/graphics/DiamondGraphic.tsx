import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art diamond graphic with animated center
 * Used for export/connectivity feature visualization
 */
export const DiamondGraphic: React.FC = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(prev => !prev);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-32 flex items-center justify-center font-mono text-[10px] leading-tight">
            <div className="relative">
                <div className="text-center" style={{ color: COLORS.PINK }}>
                    <div>    ╱╲    </div>
                    <div>   ╱  ╲   </div>
                    <div>  ╱ {animate ? '██' : '░░'} ╲  </div>
                    <div> ╱      ╲ </div>
                    <div>╱________╲</div>
                    <div>╲        ╱</div>
                    <div> ╲      ╱ </div>
                    <div>  ╲    ╱  </div>
                    <div>   ╲  ╱   </div>
                    <div>    ╲╱    </div>
                </div>
            </div>
        </div>
    );
};
