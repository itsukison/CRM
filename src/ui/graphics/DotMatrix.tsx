import React from 'react';

/**
 * 8x8 dot matrix grid with random blue and pink highlights
 * Pure presentational component with random rendering
 */
export const DotMatrix: React.FC = () => {
    return (
        <div className="grid grid-cols-8 gap-2 opacity-60">
            {Array.from({ length: 64 }).map((_, i) => (
                <div
                    key={i}
                    className={`w-1 h-1 transition-all duration-300 
                        ${Math.random() > 0.9 ? 'bg-blue-600 scale-150' :
                            Math.random() > 0.95 ? 'bg-pink-400 scale-150' : 'bg-gray-300'}`}
                />
            ))}
        </div>
    );
};
