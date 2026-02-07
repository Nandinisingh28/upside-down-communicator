import React, { useRef, useEffect, useState } from 'react';
import './FrequencyDial.css';

function FrequencyDial({
    frequency = 600,
    onFrequencyChange,
    corrupted = false,
    disabled = false
}) {
    const dialRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [tuningStatus, setTuningStatus] = useState('STABLE');

    // Min/max frequency range
    const MIN_FREQ = 100;
    const MAX_FREQ = 900;
    const OPTIMAL_FREQ = 600;

    // Hidden frequencies
    const HIDDEN_FREQUENCIES = {
        333: 'ENTITY DETECTED',
        666: 'UPSIDE DOWN LINK',
        777: 'SECRET CHANNEL'
    };

    // Calculate rotation angle from frequency
    const getRotation = (freq) => {
        const normalized = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
        return -135 + normalized * 270; // -135 to 135 degrees
    };

    // Calculate frequency from rotation angle
    const getFrequencyFromAngle = (angle) => {
        const normalized = (angle + 135) / 270;
        return Math.round(MIN_FREQ + normalized * (MAX_FREQ - MIN_FREQ));
    };

    // Determine tuning status based on frequency
    useEffect(() => {
        const diff = Math.abs(frequency - OPTIMAL_FREQ);

        if (HIDDEN_FREQUENCIES[frequency]) {
            setTuningStatus(HIDDEN_FREQUENCIES[frequency]);
        } else if (diff <= 20) {
            setTuningStatus('STABLE');
        } else if (diff <= 100) {
            setTuningStatus('PARTIAL SIGNAL');
        } else if (diff <= 200) {
            setTuningStatus('GHOST SIGNAL');
        } else {
            setTuningStatus('HEAVY CORRUPTION');
        }
    }, [frequency]);

    // Handle dial rotation
    const handleDialInteraction = (e) => {
        if (disabled || !dialRef.current) return;

        const rect = dialRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

        if (!clientX || !clientY) return;

        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

        // Convert angle to frequency (clamp to valid range)
        let rotationAngle = angle + 90; // Offset so up is 0
        if (rotationAngle < -135) rotationAngle = -135;
        if (rotationAngle > 135) rotationAngle = 135;

        const newFreq = getFrequencyFromAngle(rotationAngle);
        const clampedFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, newFreq));

        onFrequencyChange(clampedFreq);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleDialInteraction(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleDialInteraction(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleDialInteraction);
            window.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleDialInteraction);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    // Get status color
    const getStatusColor = () => {
        if (HIDDEN_FREQUENCIES[frequency]) return 'hidden';
        const diff = Math.abs(frequency - OPTIMAL_FREQ);
        if (diff <= 20) return 'stable';
        if (diff <= 100) return 'warning';
        return 'danger';
    };

    return (
        <div className={`frequency-dial ${corrupted ? 'corrupted' : ''}`}>
            <div className="dial-header">
                <span className="dial-icon">◆</span>
                <span className="dial-title">FREQUENCY TUNER</span>
                <span className="dial-freq">{frequency} Hz</span>
            </div>

            <div className="dial-container">
                <div className="dial-scale">
                    <span className="scale-mark" style={{ transform: 'rotate(-135deg)' }}>100</span>
                    <span className="scale-mark" style={{ transform: 'rotate(-67deg)' }}>300</span>
                    <span className="scale-mark" style={{ transform: 'rotate(0deg)' }}>500</span>
                    <span className="scale-mark" style={{ transform: 'rotate(67deg)' }}>700</span>
                    <span className="scale-mark" style={{ transform: 'rotate(135deg)' }}>900</span>
                </div>

                <div
                    ref={dialRef}
                    className={`dial-knob ${isDragging ? 'dragging' : ''}`}
                    style={{ transform: `rotate(${getRotation(frequency)}deg)` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    <div className="dial-indicator" />
                    <div className="dial-grip">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="grip-notch" />
                        ))}
                    </div>
                </div>

                <div className="optimal-marker" />
            </div>

            <div className={`tuning-status ${getStatusColor()}`}>
                <span className="status-led" />
                <span className="status-text">{tuningStatus}</span>
            </div>

            <div className="dial-footer">
                <span>TUNE FOR 600Hz</span>
            </div>
        </div>
    );
}

export default FrequencyDial;
