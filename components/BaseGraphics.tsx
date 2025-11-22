
import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../constants';

// --- 1. Data Map (Vertical Lines + Data Points) ---
export const DataMap: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const cols = 120;
    const gap = width / cols;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < cols; i++) {
        const x = i * gap;
        const normalizedX = (i / cols) * Math.PI * 3; 
        
        const shape = Math.sin(normalizedX) * Math.sin(normalizedX * 0.5 + 1) * 0.5 + 0.5; 
        
        const noise = Math.sin(i * 0.3 + time * 0.5) * 0.1;
        
        let barHeight = (shape * height * 0.7) + (noise * height);
        if (barHeight < 0) barHeight = 0;

        const centerY = height / 2;
        const top = centerY - barHeight / 2;
        const bottom = centerY + barHeight / 2;

        // Draw Base Line
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.strokeStyle = COLORS.GRAY_15;
        ctx.lineWidth = gap * 0.4;
        ctx.lineCap = 'butt';
        ctx.stroke();

        // Activity Layers
        const activityNoise = Math.sin(i * 0.2 - time) + Math.cos(i * 0.5 + time * 0.5);
        
        // Pink Strata (Replacing Yellow)
        if (i % 2 === 0 && activityNoise > 0.5) {
           const h = barHeight * 0.1;
           const y = top + barHeight * 0.3;
           ctx.beginPath();
           ctx.moveTo(x, y);
           ctx.lineTo(x, y + h);
           ctx.strokeStyle = COLORS.PINK;
           ctx.lineWidth = gap * 0.6;
           ctx.stroke();
        }

        // Blue Clusters
        if (activityNoise > 1.2) {
           const h = gap * 0.8;
           const y = top - h * 2;
           ctx.beginPath();
           ctx.moveTo(x, y);
           ctx.lineTo(x, y + h);
           ctx.strokeStyle = COLORS.BLUE;
           ctx.lineWidth = gap * 0.8;
           ctx.stroke();
        }

        // Green Data
        if (Math.sin(i * 123 + time) > 0.9) {
            const y = bottom - barHeight * 0.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + gap);
            ctx.strokeStyle = COLORS.GREEN;
            ctx.lineWidth = gap * 0.6;
            ctx.stroke();
        }
      }
      
      time += 0.005;
      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};

// --- 2. Vertical Bar Chart Graphic (Pixelated) ---
export const BarChartGraphic: React.FC<{ color?: string }> = ({ color = COLORS.BLUE }) => {
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
                )
            })}
        </div>
    )
}

// --- 3. Dot Matrix Graphic ---
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
    )
}

// --- 4. Pixel Grid Background ---
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

// --- 5. Block Status Grid (Replacement for Spinning Visual) ---
export const BlockStatusGrid: React.FC = () => {
    const [blocks, setBlocks] = useState<Array<{id: number, color: string}>>([]);

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
