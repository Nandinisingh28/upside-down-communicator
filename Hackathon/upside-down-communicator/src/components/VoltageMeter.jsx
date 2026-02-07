import React, { useEffect, useRef } from 'react';
import './VoltageMeter.css';

function VoltageMeter({ voltage = 50, corrupted = false }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height - 20;
        const radius = Math.min(width, height) - 40;

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Draw arc background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
        ctx.strokeStyle = '#003322';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw scale marks
        const numMarks = 10;
        for (let i = 0; i <= numMarks; i++) {
            const angle = Math.PI + (i / numMarks) * Math.PI;
            const innerR = radius - 10;
            const outerR = radius;

            const x1 = centerX + Math.cos(angle) * innerR;
            const y1 = centerY + Math.sin(angle) * innerR;
            const x2 = centerX + Math.cos(angle) * outerR;
            const y2 = centerY + Math.sin(angle) * outerR;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = i > 7 ? '#ff0040' : '#00ff88';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw colored zones
        // Green zone (0-60%)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, Math.PI, Math.PI + 0.6 * Math.PI, false);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Yellow zone (60-80%)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, Math.PI + 0.6 * Math.PI, Math.PI + 0.8 * Math.PI, false);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
        ctx.stroke();

        // Red zone (80-100%)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, Math.PI + 0.8 * Math.PI, 2 * Math.PI, false);
        ctx.strokeStyle = 'rgba(255, 0, 64, 0.3)';
        ctx.stroke();

        // Draw needle
        const needleAngle = Math.PI + (voltage / 100) * Math.PI;
        const needleLength = radius - 25;

        // Add jitter if corrupted
        const jitter = corrupted ? (Math.random() - 0.5) * 0.1 : 0;
        const finalAngle = needleAngle + jitter;

        const needleX = centerX + Math.cos(finalAngle) * needleLength;
        const needleY = centerY + Math.sin(finalAngle) * needleLength;

        // Needle shadow/glow
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = corrupted ? '#ff0040' : '#00ffff';
        ctx.lineWidth = 4;
        ctx.shadowColor = corrupted ? '#ff0040' : '#00ffff';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Needle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = corrupted ? '#ff0040' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = corrupted ? '#ff0040' : '#00ffff';
        ctx.fill();

    }, [voltage, corrupted]);

    return (
        <div className={`voltage-meter ${corrupted ? 'corrupted' : ''}`}>
            <div className="meter-header">
                <span className="meter-icon">◆</span>
                <span className="meter-title">VOLTAGE</span>
                <span className="meter-value">{voltage}V</span>
            </div>

            <div className="gauge-container">
                <canvas ref={canvasRef} width={200} height={120} />
            </div>

            <div className="voltage-labels">
                <span>0V</span>
                <span>50V</span>
                <span>100V</span>
            </div>

            <div className="meter-footer">
                <span className={`status ${voltage > 80 ? 'warning' : ''}`}>
                    {voltage > 80 ? '⚠ HIGH LOAD' : voltage > 50 ? 'NOMINAL' : 'LOW POWER'}
                </span>
            </div>
        </div>
    );
}

export default VoltageMeter;
