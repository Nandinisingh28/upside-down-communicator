import React, { useState } from 'react';
import './QuickActions.css';

const QUICK_MESSAGES = [
    { label: 'HELP', message: 'HELP', icon: '◆' },
    { label: 'SOS', message: 'SOS', icon: '⚠' },
    { label: 'WHO', message: 'WHO ARE YOU', icon: '?' },
    { label: 'WHERE', message: 'WHERE AM I', icon: '◎' },
];

const POWER_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'MAXIMUM'];

function QuickActions({
    onQuickTransmit,
    isTransmitting,
    corrupted,
    powerLevel = 1,
    onPowerChange,
    onEmergencyShutdown
}) {
    const [selectedPreset, setSelectedPreset] = useState(null);

    const handleQuickMessage = (preset) => {
        if (isTransmitting || corrupted) return;
        setSelectedPreset(preset.label);
        onQuickTransmit(preset.message);
        setTimeout(() => setSelectedPreset(null), 1000);
    };

    return (
        <div className={`quick-actions ${corrupted ? 'corrupted' : ''}`}>
            <div className="qa-header">
                <span className="qa-icon">◆</span>
                <span className="qa-title">QUICK TRANSMISSION</span>
            </div>

            <div className="quick-buttons">
                {QUICK_MESSAGES.map((preset) => (
                    <button
                        key={preset.label}
                        className={`quick-btn ${selectedPreset === preset.label ? 'active' : ''}`}
                        onClick={() => handleQuickMessage(preset)}
                        disabled={isTransmitting || corrupted}
                    >
                        <span className="btn-icon">{preset.icon}</span>
                        <span className="btn-label">{preset.label}</span>
                    </button>
                ))}
            </div>

            <div className="power-control">
                <div className="power-label">SIGNAL POWER</div>
                <div className="power-slider">
                    {POWER_LEVELS.map((level, index) => (
                        <button
                            key={level}
                            className={`power-level ${index <= powerLevel ? 'active' : ''} ${index === powerLevel ? 'current' : ''}`}
                            onClick={() => onPowerChange && onPowerChange(index)}
                            disabled={corrupted}
                        >
                            {level.charAt(0)}
                        </button>
                    ))}
                </div>
                <div className="power-value">{POWER_LEVELS[powerLevel]}</div>
            </div>

            <button
                className="emergency-btn"
                onClick={onEmergencyShutdown}
                disabled={!isTransmitting}
            >
                ⚡ EMERGENCY STOP ⚡
            </button>
        </div>
    );
}

export default QuickActions;
