import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * ASCII art database schema visualization with animated table highlighting
 * Shows example tables with columns
 */
export const SchemaGraphic: React.FC = () => {
    const [activeTable, setActiveTable] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTable(prev => (prev + 1) % 3);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const getTableStyle = (index: number) => ({
        color: activeTable === index ? COLORS.BLUE : COLORS.GRAY_30
    });

    return (
        <div className="w-full h-48 flex items-center justify-center font-mono text-[9px] leading-tight">
            <div className="relative text-center">
                <div style={getTableStyle(0)}>
                    <div>┌─────────────────┐</div>
                    <div>│ TABLE: contacts │</div>
                    <div>├─────────────────┤</div>
                    <div>│ id    │ INT     │</div>
                    <div>│ name  │ TEXT    │</div>
                    <div>│ email │ TEXT    │</div>
                    <div>└─────────────────┘</div>
                </div>
                <div className="mt-2" style={getTableStyle(1)}>
                    <div>┌─────────────────┐</div>
                    <div>│ TABLE: companies│</div>
                    <div>├─────────────────┤</div>
                    <div>│ id    │ INT     │</div>
                    <div>│ name  │ TEXT    │</div>
                    <div>└─────────────────┘</div>
                </div>
            </div>
        </div>
    );
};
