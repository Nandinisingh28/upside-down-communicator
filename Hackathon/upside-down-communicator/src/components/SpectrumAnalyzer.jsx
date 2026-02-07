import React, { useEffect, useRef } from 'react';
import './SpectrumAnalyzer.css';

function SpectrumAnalyzer({
    frequency = 600,
    isActive = false,
    corrupted = false,
    signalStrength = 50
}) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const barsRef = useRef(Array(16).fill(0));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const numBars = 16;
        const barWidth = (width - (numBars - 1) * 2) / numBars;

        const animate = () => {
            // Clear
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = '#003322';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = (height / 4) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Calculate bar heights based on frequency and activity
            const centerFreq = Math.floor((frequency / 100) * numBars) - 1;

            for (let i = 0; i < numBars; i++) {
                // Target height based on frequency distance
                let targetHeight;
                const distance = Math.abs(i - centerFreq);

                if (isActive) {
                    if (distance === 0) {
                        targetHeight = 0.8 + Math.random() * 0.2;
                    } else if (distance <= 2) {
                        targetHeight = 0.4 + Math.random() * 0.3;
                    } else {
                        targetHeight = 0.05 + Math.random() * 0.1;
                    }
                    targetHeight *= (signalStrength / 100);
                } else {
                    // Idle noise
                    targetHeight = 0.02 + Math.random() * 0.05;
                }

                // Add corruption effects
                if (corrupted) {
                    targetHeight = Math.random() * 0.8;
                }

                // Smooth transition
                barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3;

                const barHeight = barsRef.current[i] * height;
                const x = i * (barWidth + 2);
                const y = height - barHeight;

                // Determine color based on height and corruption
                let gradient;
                if (corrupted) {
                    gradient = ctx.createLinearGradient(x, height, x, y);
                    gradient.addColorStop(0, '#ff0040');
                    gradient.addColorStop(0.5, '#ff00ff');
                    gradient.addColorStop(1, '#00ffff');
                } else {
                    gradient = ctx.createLinearGradient(x, height, x, y);
                    gradient.addColorStop(0, '#00ff88');
                    gradient.addColorStop(0.6, '#00ffff');
                    gradient.addColorStop(1, '#ffffff');
                }

                // Draw bar
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);

                // Draw peak indicator
                ctx.fillStyle = corrupted ? '#ff0040' : '#ffffff';
                ctx.fillRect(x, y - 2, barWidth, 2);
            }

            // Draw frequency marker
            const markerX = (frequency / 1000) * width;
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(markerX, 0);
            ctx.lineTo(markerX, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw interference spikes if corrupted
            if (corrupted && Math.random() > 0.7) {
                const spikeX = Math.random() * width;
                ctx.strokeStyle = '#ff0040';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(spikeX, height);
                ctx.lineTo(spikeX, Math.random() * height * 0.3);
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [frequency, isActive, corrupted, signalStrength]);

    // Frequency labels
    const freqLabels = ['100', '300', '500', '700', '900'];

    return (
        <div className={`spectrum-analyzer ${corrupted ? 'corrupted' : ''}`}>
            <div className="analyzer-header">
                <span className="analyzer-icon">◆</span>
                <span className="analyzer-title">SPECTRUM ANALYZER</span>
                <span className="analyzer-freq">{frequency} Hz</span>
            </div>

            <div className="analyzer-display">
                <canvas ref={canvasRef} width={280} height={100} />
            </div>

            <div className="freq-scale">
                {freqLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                ))}
            </div>

            <div className="analyzer-footer">
                <span className="analyzer-status">
                    {corrupted ? '⚠ INTERFERENCE DETECTED' : isActive ? 'ANALYZING' : 'STANDBY'}
                </span>
            </div>
        </div>
    );
}

export default SpectrumAnalyzer;
