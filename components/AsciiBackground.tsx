
import React, { useEffect, useRef } from 'react';

export const AsciiBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // More technical, smaller characters
    const chars = ['0', '1', '.', '+', '·'];
    const charSize = 16; 
    
    let columns = Math.ceil(width / charSize);
    let rows = Math.ceil(height / charSize);

    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      columns = Math.ceil(width / charSize);
      rows = Math.ceil(height / charSize);
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '10px monospace';
      
      time += 0.01;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const posX = x * charSize;
          const posY = y * charSize;
          
          // Distance from mouse
          const dx = posX - mouseRef.current.x;
          const dy = posY - mouseRef.current.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const maxDist = 300;
          
          // Background wave
          const wave = Math.sin(x * 0.02 + time) + Math.cos(y * 0.02 + time * 0.5);
          
          // Interaction boost
          let activeBoost = 0;
          if (dist < maxDist) {
              activeBoost = (1 - dist/maxDist);
          }
          
          const index = Math.floor(((wave + 2) / 4) * chars.length) % chars.length;
          let char = chars[Math.max(0, index)];

          // Default style
          ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
          
          // Highlight near mouse
          if (activeBoost > 0) {
              if (Math.random() > 0.9 - (activeBoost * 0.1)) {
                   ctx.fillStyle = `rgba(0, 53, 189, ${activeBoost * 0.4})`; // Dark Blue
                   if (Math.random() > 0.8) char = String.fromCharCode(0x30A0 + Math.random() * 96); // Katakana glitch
              }
          } else if (Math.random() > 0.999) {
               // Random glimmers elsewhere
               ctx.fillStyle = '#0035BD';
          }

          ctx.fillText(char, posX, posY);
        }
      }

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-white">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};
