import React from 'react';
import './SignalStrengthMeter.css';

function SignalStrengthMeter({ strength = 0, corrupted = false }) {
    // Strength is 0-100
    const bars = 10;
    const activeBars = Math.floor((strength / 100) * bars);

    const getBarClass = (index) => {
        if (index >= activeBars) return 'bar inactive';
        if (index >= 7) return 'bar active high';
        if (index >= 4) return 'bar active medium';
        return 'bar active low';
    };

    return (
        <div className={`signal-strength-meter ${corrupted ? 'corrupted' : ''}`}>
            <div className="meter-header">
                <span className="meter-icon">◆</span>
                <span className="meter-title">SIGNAL STRENGTH</span>
                <span className="meter-value">{strength}%</span>
            </div>

            <div className="vu-meter">
                <div className="vu-scale">
                    <span>-20</span>
                    <span>-10</span>
                    <span>0</span>
                    <span>+3</span>
                </div>
                <div className="vu-bars">
                    {Array.from({ length: bars }, (_, i) => (
                        <div
                            key={i}
                            className={getBarClass(i)}
                            style={{
                                animationDelay: corrupted ? `${Math.random() * 0.2}s` : '0s'
                            }}
                        />
                    ))}
                </div>
                <div className="vu-labels">
                    <span>WEAK</span>
                    <span>STRONG</span>
                </div>
            </div>

            <div className="meter-footer">
                <span className="status-dot" />
                <span>{strength > 50 ? 'LOCKED' : 'SEARCHING'}</span>
            </div>
        </div>
    );
}

export default SignalStrengthMeter;
