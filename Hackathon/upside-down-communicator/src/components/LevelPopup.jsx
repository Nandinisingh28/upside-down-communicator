import React, { useEffect } from 'react';
import './LevelPopup.css';

const LevelPopup = ({ stage, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const messages = {
        1: { title: 'SIGNAL STABILIZED', sub: 'STAGE 1 COMPLETE' },
        2: { title: 'POWER SURGE ACTIVE', sub: 'STAGE 2 COMPLETE' },
        3: { title: 'SYSTEM PURGED', sub: 'RECOVERY COMPLETE' }
    };

    const content = messages[stage] || { title: 'STAGE COMPLETE', sub: '' };

    return (
        <div className="level-popup-overlay">
            <div className="level-popup-content">
                <div className="level-icon">★</div>
                <div className="level-title">{content.title}</div>
                <div className="level-sub">{content.sub}</div>
                <div className="level-progress-bar">
                    <div className="level-progress-fill" />
                </div>
            </div>
        </div>
    );
};

export default LevelPopup;
