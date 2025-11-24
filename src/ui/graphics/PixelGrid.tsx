import React from 'react';
import { COLORS } from '@/config/constants';

/**
 * Background grid pattern overlay
 * Creates a subtle pixel grid effect
 */
export const PixelGrid: React.FC = () => {
    return (
        <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
                backgroundImage: `
                    linear-gradient(to right, ${COLORS.GRAY_10} 1px, transparent 1px),
                    linear-gradient(to bottom, ${COLORS.GRAY_10} 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                opacity: 0.5
            }}
        />
    );
};
