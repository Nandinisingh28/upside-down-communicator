import React, { useState, useEffect } from 'react';
import './PortalPage.css';

const PortalPage = ({ onEnter }) => {
    const [glitch, setGlitch] = useState(false);
    const [text, setText] = useState('');
    const fullText = "WARNING: RESTRICTED FREQUENCY";

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

    return (
        <div className={`portal-container ${glitch ? 'glitch-active' : ''}`}>
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
                        <span className="status-value">UNSTABLE</span>
                    </div>
                </div>

                <button className="enter-button" onClick={onEnter}>
                    <span className="button-text">OPEN GATE</span>
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
