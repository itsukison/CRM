import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art data stream graphic - Horizontal / Light Theme
 * Used for "1,200+ Companies" stats card
 */
export const DataStreamGraphic: React.FC = () => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(prev => (prev + 1) % 8);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const getStream = () => {
        const chars = ['1', '0', '1', '1', '0', '0', '1', '0', '1', '1', '1', '0'];
        // Create a scrolling effect
        const visible = [];
        for (let i = 0; i < 20; i++) {
            visible.push(chars[(frame + i) % chars.length]);
        }
        return visible.join(' ');
    };

    return (
        <div className="w-full h-full flex items-center px-6 font-mono text-[10px] leading-tight overflow-hidden bg-gray-50 text-gray-800">
            <div className="flex items-center w-full gap-6">
                {/* Left: Server Status */}
                <div className="shrink-0 border-r-2 border-gray-200 pr-6">
                    <div className="font-bold mb-1">SERVER_01</div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${frame % 2 === 0 ? 'bg-green-500' : 'bg-green-200'}`}></div>
                        <span className="text-[8px] font-bold text-green-600">ONLINE</span>
                    </div>
                </div>

                {/* Right: Data Stream */}
                <div className="flex-grow overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50 z-10"></div>
                    <div className="whitespace-nowrap font-bold opacity-60" style={{ color: COLORS.PINK }}>
                        {getStream()}
                    </div>
                    <div className="whitespace-nowrap font-bold opacity-40 mt-1" style={{ color: COLORS.PINK }}>
                        {getStream()}
                    </div>
                </div>
            </div>
        </div>
    );
};
