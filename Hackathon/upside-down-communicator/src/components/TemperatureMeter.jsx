import React, { useEffect, useRef } from 'react';
import './TemperatureMeter.css';

function TemperatureMeter({
    temperature = 30,
    corrupted = false,
    isOverheating = false,
    onVentSystem
}) {
    const canvasRef = useRef(null);

    // Temperature thresholds
    const TEMP_WARNING = 70;
    const TEMP_CRITICAL = 85;
    const TEMP_SHUTDOWN = 100;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Draw thermometer body
        const bulbRadius = 20;
        const tubeWidth = 12;
        const tubeHeight = height - bulbRadius * 2 - 20;
        const tubeX = width / 2 - tubeWidth / 2;
        const tubeY = 10;

        // Tube background
        ctx.fillStyle = '#001a0d';
        ctx.strokeStyle = '#00aa66';
        ctx.lineWidth = 2;

        // Draw tube
        ctx.beginPath();
        ctx.roundRect(tubeX, tubeY, tubeWidth, tubeHeight, 6);
        ctx.fill();
        ctx.stroke();

        // Draw bulb
        const bulbX = width / 2;
        const bulbY = tubeY + tubeHeight + bulbRadius - 5;

        ctx.beginPath();
        ctx.arc(bulbX, bulbY, bulbRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Calculate fill height based on temperature
        const fillHeight = (temperature / 100) * (tubeHeight - 10);
        const fillY = tubeY + tubeHeight - fillHeight - 5;

        // Determine fill color based on temperature
        let fillColor;
        if (temperature >= TEMP_CRITICAL) {
            fillColor = '#ff0040';
        } else if (temperature >= TEMP_WARNING) {
            fillColor = '#ffaa00';
        } else {
            fillColor = '#00ff88';
        }

        // Add corruption color
        if (corrupted) {
            fillColor = '#ff00ff';
        }

        // Draw mercury fill
        ctx.fillStyle = fillColor;

        // Fill tube
        ctx.beginPath();
        ctx.roundRect(tubeX + 2, fillY, tubeWidth - 4, tubeY + tubeHeight - fillY - 7, 4);
        ctx.fill();

        // Fill bulb
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, bulbRadius - 4, 0, 2 * Math.PI);
        ctx.fill();

        // Add glow effect for high temps
        if (temperature >= TEMP_WARNING) {
            ctx.shadowColor = fillColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(bulbX, bulbY, bulbRadius - 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Draw scale marks
        ctx.fillStyle = '#006644';
        ctx.font = '6px "Press Start 2P"';
        ctx.textAlign = 'left';

        const marks = [0, 25, 50, 75, 100];
        marks.forEach(mark => {
            const markY = tubeY + tubeHeight - 5 - (mark / 100) * (tubeHeight - 10);
            ctx.fillRect(tubeX + tubeWidth + 3, markY, 5, 1);
            ctx.fillText(`${mark}°`, tubeX + tubeWidth + 10, markY + 3);
        });

        // Draw warning zones
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.3)';
        ctx.lineWidth = 1;
        const warningY = tubeY + tubeHeight - 5 - (TEMP_WARNING / 100) * (tubeHeight - 10);
        ctx.beginPath();
        ctx.moveTo(tubeX - 5, warningY);
        ctx.lineTo(tubeX + tubeWidth + 5, warningY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 0, 64, 0.3)';
        const criticalY = tubeY + tubeHeight - 5 - (TEMP_CRITICAL / 100) * (tubeHeight - 10);
        ctx.beginPath();
        ctx.moveTo(tubeX - 5, criticalY);
        ctx.lineTo(tubeX + tubeWidth + 5, criticalY);
        ctx.stroke();

    }, [temperature, corrupted]);

    const getStatusText = () => {
        if (temperature >= TEMP_SHUTDOWN) return 'SHUTDOWN';
        if (temperature >= TEMP_CRITICAL) return 'CRITICAL';
        if (temperature >= TEMP_WARNING) return 'WARNING';
        return 'NOMINAL';
    };

    const getStatusClass = () => {
        if (temperature >= TEMP_CRITICAL) return 'critical';
        if (temperature >= TEMP_WARNING) return 'warning';
        return 'normal';
    };

    return (
        <div className={`temperature-meter ${corrupted ? 'corrupted' : ''} ${isOverheating ? 'overheating' : ''}`}>
            <div className="temp-header">
                <span className="temp-icon">◆</span>
                <span className="temp-title">CORE TEMP</span>
                <span className="temp-value">{Math.round(temperature)}°C</span>
            </div>

            <div className="thermometer-container">
                <canvas ref={canvasRef} width={100} height={150} />
            </div>

            <div className={`temp-status ${getStatusClass()}`}>
                <span className="status-led" />
                <span>{getStatusText()}</span>
            </div>

            {temperature >= TEMP_CRITICAL && (
                <button
                    className="vent-button"
                    onClick={onVentSystem}
                    disabled={isOverheating}
                >
                    {isOverheating ? 'VENTING...' : '⚡ VENT SYSTEM'}
                </button>
            )}
        </div>
    );
}

export default TemperatureMeter;
