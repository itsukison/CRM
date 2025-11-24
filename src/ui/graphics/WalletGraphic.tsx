import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art wallet/security graphic with lock animation
 * Used for security feature visualization
 */
export const WalletGraphic: React.FC = () => {
    const [locked, setLocked] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setLocked(prev => !prev);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-32 flex items-center justify-center font-mono text-[10px] leading-tight">
            <div className="relative">
                <div className="text-center" style={{ color: COLORS.BLUE }}>
                    <div>  ┌─────┐  </div>
                    <div>  │ {locked ? '█▓█' : '░▒░'} │  </div>
                    <div>┌─┴─────┴─┐</div>
                    <div>│ ═══════ │</div>
                    <div>│ [{locked ? '🔒' : '🔓'}]     │</div>
                    <div>│ ═══════ │</div>
                    <div>│ ═══════ │</div>
                    <div>└─────────┘</div>
                </div>
            </div>
        </div>
    );
};
