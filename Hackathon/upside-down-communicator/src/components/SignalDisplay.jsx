import React, { useEffect, useRef } from 'react';
import { SIGNAL } from '../utils/encoder';
import './SignalDisplay.css';

const SignalDisplay = ({ currentSignal, isTransmitting, corrupted }) => {
    const ledCount = 8;

    const getLedStates = () => {
        const states = Array(ledCount).fill(false);

        if (!isTransmitting || !currentSignal || !currentSignal.signal) {
            return states;
        }

        const { signal, progress } = currentSignal;

        if (signal.type === SIGNAL.DOT) {
            // Dot: light up center LEDs briefly
            const centerStart = 3;
            const centerEnd = 5;
            for (let i = centerStart; i < centerEnd; i++) {
                states[i] = progress < 0.8;
            }
        } else if (signal.type === SIGNAL.DASH) {
            // Dash: cascade through all LEDs
            const activeCount = Math.floor(progress * ledCount);
            for (let i = 0; i < ledCount; i++) {
                states[i] = i <= activeCount;
            }
        }

        // Add corruption randomness
        if (corrupted) {
            for (let i = 0; i < ledCount; i++) {
                if (Math.random() < 0.3) {
                    states[i] = !states[i];
                }
            }
        }

        return states;
    };

    const ledStates = getLedStates();

    return (
        <div className={`signal-display ${corrupted ? 'corrupted' : ''}`}>
            <div className="signal-header">
                <span className="signal-label">◆ SIGNAL TRANSMISSION ◆</span>
                <span className={`signal-status ${isTransmitting ? 'active' : ''}`}>
                    {isTransmitting ? 'TRANSMITTING' : 'STANDBY'}
                </span>
            </div>

            <div className="led-panel">
                <div className="led-row">
                    {ledStates.map((active, index) => (
                        <div
                            key={index}
                            className={`led ${active ? 'led-on' : 'led-off'} ${corrupted && active ? 'led-corrupt' : ''}`}
                        >
                            <div className="led-glow" />
                        </div>
                    ))}
                </div>

                <div className="led-labels">
                    {Array(ledCount).fill(0).map((_, i) => (
                        <span key={i} className="led-label">{i + 1}</span>
                    ))}
                </div>
            </div>

            <div className="signal-info">
                <div className="signal-type">
                    {currentSignal?.signal?.type === SIGNAL.DOT && '● DOT'}
                    {currentSignal?.signal?.type === SIGNAL.DASH && '━ DASH'}
                    {currentSignal?.signal?.type === SIGNAL.CHAR_GAP && '◌ GAP'}
                    {currentSignal?.signal?.type === SIGNAL.WORD_GAP && '◌◌ WORD'}
                    {!currentSignal?.signal && '○ IDLE'}
                </div>
            </div>
        </div>
    );
};

export default SignalDisplay;
