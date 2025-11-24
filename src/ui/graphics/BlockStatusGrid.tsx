import React, { useState, useEffect } from 'react';
import { COLORS } from '@/config/constants';

/**
 * Animated 10x10 block grid showing memory allocation status
 * Blocks randomly light up in different colors and decay back to gray
 */
export const BlockStatusGrid: React.FC = () => {
    const [blocks, setBlocks] = useState<Array<{ id: number, color: string }>>([]);

    useEffect(() => {
        // Initialize grid
        const initialBlocks = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            color: COLORS.GRAY_15
        }));
        setBlocks(initialBlocks);

        const interval = setInterval(() => {
            setBlocks(prev => prev.map(block => {
                if (Math.random() > 0.98) {
                    const colors = [COLORS.BLUE, COLORS.GREEN, COLORS.PINK, COLORS.PINK, COLORS.GRAY_15];
                    return { ...block, color: colors[Math.floor(Math.random() * colors.length)] };
                }
                // Decay back to gray slowly
                if (Math.random() > 0.95 && block.color !== COLORS.GRAY_15) {
                    return { ...block, color: COLORS.GRAY_15 };
                }
                return block;
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-md aspect-square bg-white border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4 font-mono text-[10px] text-gray-400 uppercase">
                <span>Memory_Block_Alloc</span>
                <span className="animate-pulse text-blue-600">● Active</span>
            </div>
            <div className="grid grid-cols-10 gap-1 w-full h-full content-start">
                {blocks.map(block => (
                    <div
                        key={block.id}
                        className="aspect-square transition-colors duration-500"
                        style={{ backgroundColor: block.color }}
                    />
                ))}
            </div>
        </div>
    );
};
