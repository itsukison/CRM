import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art phone/device graphic with animated screen
 * Used for scalability feature visualization
 */
export const PhoneGraphic: React.FC = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimate(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-32 flex items-center justify-center font-mono text-[8px] leading-tight">
            <div className="relative">
                <div className="text-center" style={{ color: COLORS.GREEN }}>
                    <div>┌──────────┐</div>
                    <div>│  [{animate ? '████' : '░░░░'}]  │</div>
                    <div>│          │</div>
                    <div>│  ══════  │</div>
                    <div>│  ══════  │</div>
                    <div>│  ══════  │</div>
                    <div>│    []    │</div>
                    <div>└──────────┘</div>
                </div>
            </div>
        </div>
    );
};
