import React from 'react';
import './SanityMeter.css';

const SanityMeter = ({ level, mode }) => {
    const getStatusText = () => {
        if (mode === 'possessed') return '⚠ CRITICAL INTERFERENCE ⚠';
        if (mode === 'recovered') return '✓ SYSTEM PURGED ✓';
        if (level > 70) return 'STABLE';
        if (level > 40) return 'DEGRADING';
        if (level > 20) return 'UNSTABLE';
        return 'CRITICAL';
    };

    const getStatusClass = () => {
        if (mode === 'possessed') return 'status-critical';
        if (mode === 'recovered') return 'status-recovered';
        if (level > 70) return 'status-stable';
        if (level > 40) return 'status-degrading';
        if (level > 20) return 'status-unstable';
        return 'status-critical';
    };

    const getBarBlocks = () => {
        const totalBlocks = 20;
        const filledBlocks = Math.ceil((level / 100) * totalBlocks);
        let bar = '';

        for (let i = 0; i < totalBlocks; i++) {
            bar += i < filledBlocks ? '█' : '░';
        }

        return bar;
    };

    return (
        <div className={`sanity-meter ${mode === 'possessed' ? 'possessed' : ''}`}>
            <div className="meter-header">
                <span className="meter-label">SYSTEM STABILITY</span>
                <span className={`meter-status ${getStatusClass()}`}>{getStatusText()}</span>
            </div>
            <div className="meter-bar-container">
                <span className="meter-bar">{getBarBlocks()}</span>
                <span className="meter-value">{Math.round(level)}%</span>
            </div>
            <div className="meter-footer">
                <span>DIMENSION LINK: {mode === 'possessed' ? 'SEVERED' : 'ACTIVE'}</span>
            </div>
        </div>
    );
};

export default SanityMeter;
