import React, { useRef, useEffect } from 'react';
import { SIGNAL } from '../utils/encoder';
import { drawStaticNoise, distortWaveform } from '../utils/corruptionEngine';
import './WaveformCanvas.css';

const WaveformCanvas = ({ currentSignal, isTransmitting, corrupted }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const historyRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            // Clear canvas
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = '#003322';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x < width; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y < height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw center line
            ctx.strokeStyle = '#00aa66';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Generate waveform data
            let amplitude = 0;
            if (isTransmitting && currentSignal?.signal) {
                const { signal, progress } = currentSignal;

                if (signal.type === SIGNAL.DOT) {
                    // Short spike
                    amplitude = Math.sin(progress * Math.PI) * 0.5;
                } else if (signal.type === SIGNAL.DASH) {
                    // Long sustained wave
                    amplitude = Math.sin(progress * Math.PI * 3) * 0.8;
                }
            }

            // Add to history
            historyRef.current.push(amplitude);
            if (historyRef.current.length > width / 2) {
                historyRef.current.shift();
            }

            // Draw waveform
            ctx.strokeStyle = corrupted ? '#ff0040' : '#00ff88';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const centerY = height / 2;
            const maxAmplitude = height * 0.4;

            for (let i = 0; i < historyRef.current.length; i++) {
                let value = historyRef.current[i];

                // Apply corruption distortion
                if (corrupted) {
                    value = distortWaveform(value, 0.5);
                }

                const x = (i / historyRef.current.length) * width;
                const y = centerY - (value * maxAmplitude);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Add glow effect
            ctx.shadowColor = corrupted ? '#ff0040' : '#00ff88';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw current position marker
            if (historyRef.current.length > 0) {
                const lastX = width;
                const lastY = centerY - (historyRef.current[historyRef.current.length - 1] * maxAmplitude);

                ctx.fillStyle = corrupted ? '#ff0040' : '#00ff88';
                ctx.beginPath();
                ctx.arc(lastX - 5, lastY, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Add scanlines
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            for (let y = 0; y < height; y += 3) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Add noise overlay if corrupted
            if (corrupted && Math.random() > 0.7) {
                drawStaticNoise(ctx, width, height, 0.3);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [currentSignal, isTransmitting, corrupted]);

    return (
        <div className={`waveform-container ${corrupted ? 'corrupted' : ''}`}>
            <div className="waveform-header">
                <span className="waveform-label">◆ OSCILLOSCOPE ◆</span>
                <span className="waveform-freq">600 Hz</span>
            </div>
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="waveform-canvas"
            />
            <div className="waveform-footer">
                <span>DECODE REQUIRED</span>
            </div>
        </div>
    );
};

export default WaveformCanvas;
