import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art hexagon graphic with animated phases
 * Used for API feature visualization
 */
export const HexagonGraphic: React.FC = () => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(prev => (prev + 1) % 3);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getFill = (index: number) => phase === index ? '██' : '░░';

    return (
        <div className="w-full h-32 flex items-center justify-center font-mono text-[10px] leading-tight">
            <div className="relative">
                <div className="text-center" style={{ color: COLORS.TAN }}>
                    <div>    ____    </div>
                    <div>   /    \   </div>
                    <div>  / {getFill(0)}  \  </div>
                    <div> |  {getFill(1)}  | </div>
                    <div>  \ {getFill(2)}  /  </div>
                    <div>   \____/   </div>
                    <div>     ||     </div>
                    <div>   API://   </div>
                </div>
            </div>
        </div>
    );
};
