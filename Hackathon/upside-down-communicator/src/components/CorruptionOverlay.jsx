import React, { useRef, useEffect } from 'react';
import { drawStaticNoise, getCorruptionFilter } from '../utils/corruptionEngine';
import './CorruptionOverlay.css';

const CorruptionOverlay = ({ active, intensity = 1 }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw static noise
            if (Math.random() > 0.3) {
                drawStaticNoise(ctx, width, height, intensity * 0.5);
            }

            // Draw horizontal tear lines
            if (Math.random() > 0.7) {
                const tearY = Math.random() * height;
                const tearHeight = 5 + Math.random() * 20;
                const tearOffset = (Math.random() - 0.5) * 50;

                ctx.fillStyle = `rgba(255, 0, 64, ${0.3 * intensity})`;
                ctx.fillRect(0, tearY, width, tearHeight);

                // Offset effect
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = `rgba(0, 255, 255, ${0.2 * intensity})`;
                ctx.fillRect(tearOffset, tearY, width, tearHeight);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [active, intensity]);

    if (!active) return null;

    return (
        <div
            className="corruption-overlay"
            style={{ filter: getCorruptionFilter(intensity * 0.3) }}
        >
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="corruption-canvas"
            />

            {/* Warning messages */}
            <div className="corruption-warnings">
                {Math.random() > 0.5 && (
                    <div className="warning-text" style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`
                    }}>
                        ⚠ SIGNAL DESTABILIZED ⚠
                    </div>
                )}
                {Math.random() > 0.6 && (
                    <div className="warning-text" style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`
                    }}>
                        ▓▓▓ INTERFERENCE DETECTED ▓▓▓
                    </div>
                )}
                {Math.random() > 0.7 && (
                    <div className="warning-text critical" style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`
                    }}>
                        !!! REALITY BREACH !!!
                    </div>
                )}
            </div>

            {/* Vignette effect */}
            <div className="vignette" />
        </div>
    );
};

export default CorruptionOverlay;
