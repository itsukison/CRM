import React, { useEffect, useRef } from 'react';
import { COLORS } from '@/config/constants';

interface DataMapProps {
    className?: string;
}

/**
 * Animated canvas data visualization with vertical lines and data points
 * Creates a wave-like pattern with activity layers
 */
export const DataMap: React.FC<DataMapProps> = ({ className }) => {
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

                // Pink Strata
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
