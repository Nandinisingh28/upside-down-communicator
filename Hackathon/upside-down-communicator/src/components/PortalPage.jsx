import React, { useState, useEffect } from 'react';
import './PortalPage.css';

const PortalPage = ({ onEnter }) => {
    const [glitch, setGlitch] = useState(false);
    const [text, setText] = useState('');
    const [charge, setCharge] = useState(0);
    const [isCharging, setIsCharging] = useState(false);
    const fullText = "WARNING: RESTRICTED FREQUENCY";

    // Typing effect and glitch loop
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) clearInterval(interval);
        }, 100);

        const glitchInterval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 200);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(glitchInterval);
        };
    }, []);

    // Charge logic
    useEffect(() => {
        let chargeInterval;
        if (isCharging) {
            chargeInterval = setInterval(() => {
                setCharge(prev => {
                    const newCharge = prev + 2; // Charged in ~1.5s
                    if (newCharge >= 100) {
                        clearInterval(chargeInterval);
                        onEnter();
                        return 100;
                    }
                    return newCharge;
                });
            }, 30);
        } else {
            // Rapid drain if released
            chargeInterval = setInterval(() => {
                setCharge(prev => {
                    if (prev <= 0) {
                        clearInterval(chargeInterval);
                        return 0;
                    }
                    return prev - 5;
                });
            }, 30);
        }
        return () => clearInterval(chargeInterval);
    }, [isCharging, onEnter]);

    const startCharge = () => setIsCharging(true);
    const endCharge = () => setIsCharging(false);

    return (
        <div className={`portal-container ${glitch || isCharging ? 'glitch-active' : ''} ${isCharging ? 'charging' : ''}`}>
            <div className="portal-content">
                <h1 className="portal-title">UPSIDE DOWN<br />COMMUNICATOR</h1>

                <div className="warning-box">
                    <span className="warning-icon">⚠</span>
                    <p className="warning-text">{text}<span className="cursor">_</span></p>
                </div>

                <div className="portal-status">
                    <div className="status-item">
                        <span className="status-label">SIGNAL STRENGTH:</span>
                        <span className="status-value blink">CRITICAL</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">GATE STATUS:</span>
                        <span className="status-value">{charge > 0 ? `${Math.round(charge)}% OPEN` : 'LOCKED'}</span>
                    </div>
                </div>

                <button
                    className={`enter-button ${charge > 0 ? 'charging' : ''}`}
                    onMouseDown={startCharge}
                    onMouseUp={endCharge}
                    onMouseLeave={endCharge}
                    onTouchStart={startCharge}
                    onTouchEnd={endCharge}
                >
                    <div className="button-progress" style={{ width: `${charge}%` }}></div>
                    <span className="button-text">
                        {charge >= 100 ? 'OPENING...' : charge > 0 ? 'HOLD TO OPEN' : 'OPEN GATE'}
                    </span>
                    <div className="button-glitch"></div>
                </button>

                <div className="portal-footer">
                    HAWKINS NATIONAL LABORATORY // RESTRICTED ACCESS
                </div>
            </div>

            <div className="vignette"></div>
            <div className="scanlines"></div>
            <div className="particles"></div>
        </div>
    );
};

export default PortalPage;
