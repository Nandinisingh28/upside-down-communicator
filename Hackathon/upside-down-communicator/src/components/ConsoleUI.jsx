import React, { useState, useEffect, useRef } from 'react';
import { getButtonCorruption, corruptText } from '../utils/corruptionEngine';
import './ConsoleUI.css';

// Keyboard inversion map for possessed mode
const invertedKeys = {
    'a': 'z', 'b': 'y', 'c': 'x', 'd': 'w', 'e': 'v', 'f': 'u', 'g': 't',
    'h': 's', 'i': 'r', 'j': 'q', 'k': 'p', 'l': 'o', 'm': 'n',
    'n': 'm', 'o': 'l', 'p': 'k', 'q': 'j', 'r': 'i', 's': 'h', 't': 'g',
    'u': 'f', 'v': 'e', 'w': 'd', 'x': 'c', 'y': 'b', 'z': 'a',
    'A': 'Z', 'B': 'Y', 'C': 'X', 'D': 'W', 'E': 'V', 'F': 'U', 'G': 'T',
    'H': 'S', 'I': 'R', 'J': 'Q', 'K': 'P', 'L': 'O', 'M': 'N',
    'N': 'M', 'O': 'L', 'P': 'K', 'Q': 'J', 'R': 'I', 'S': 'H', 'T': 'G',
    'U': 'F', 'V': 'E', 'W': 'D', 'X': 'C', 'Y': 'B', 'Z': 'A'
};

const ConsoleUI = ({
    onTransmit,
    isTransmitting,
    mode,
    corrupted,
    recoveryProgress,
    isPossessed,
    recoverySequence = []
}) => {
    const [message, setMessage] = useState('');
    const [buttonCorruption, setButtonCorruption] = useState({});
    const [invertedMessage, setInvertedMessage] = useState('');
    const inputRef = useRef(null);

    // Update button corruption during possessed mode
    useEffect(() => {
        if (corrupted) {
            const interval = setInterval(() => {
                setButtonCorruption(getButtonCorruption(0.8));
            }, 200);
            return () => clearInterval(interval);
        } else {
            setButtonCorruption({});
        }
    }, [corrupted]);

    // Handle keyboard inversion during possessed mode
    const handleInputChange = (e) => {
        const newValue = e.target.value;

        if (isPossessed) {
            // Reverse the keyboard: swap letters A-Z with Z-A
            const lastChar = newValue.slice(-1);
            const invertedChar = invertedKeys[lastChar] || lastChar;

            if (newValue.length > message.length) {
                // Character added - invert it
                setMessage(prev => prev + invertedChar);
            } else {
                // Character deleted
                setMessage(newValue);
            }
        } else {
            setMessage(newValue);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isPossessed) {
            // INVERTED LOGIC: Transmit button CLEARS the message instead
            setMessage('');
            return;
        }

        if (message.trim() && !isTransmitting) {
            onTransmit(message);
            setMessage('');
        }
    };

    // INVERTED LOGIC: Clear button TRANSMITS during possessed mode
    const handleClear = () => {
        if (isPossessed && message.trim()) {
            // Inverted: Clear button actually transmits!
            onTransmit(message);
            setMessage('');
        } else {
            setMessage('');
        }
    };

    const getButtonStyle = () => {
        if (!corrupted) return {};

        return {
            transform: `translate(${buttonCorruption.offsetX || 0}px, ${buttonCorruption.offsetY || 0}px) scale(${buttonCorruption.scale || 1})`,
            opacity: buttonCorruption.opacity || 1
        };
    };

    const getDisplayLabel = (text) => {
        if (corrupted) {
            return corruptText(text, 0.4);
        }
        return text;
    };

    return (
        <div className={`console-ui ${corrupted ? 'corrupted' : ''}`}>
            <div className="console-header">
                <div className="console-title">
                    {getDisplayLabel('◆ DIMENSION TERMINAL ◆')}
                </div>
                <div className="console-status">
                    <span className={`status-indicator ${mode}`} />
                    <span className="status-text">{getDisplayLabel(mode.toUpperCase())}</span>
                </div>
            </div>

            {/* Inversion warning during possessed mode */}
            {isPossessed && (
                <div className="inversion-warning">
                    ⚠ CONTROLS INVERTED ⚠ KEYBOARD REVERSED ⚠
                </div>
            )}

            {/* Recovery sequence hint - shows the randomized code */}
            {isPossessed && recoverySequence.length > 0 && (
                <div className="recovery-hint">
                    <span className="hint-label">ESCAPE CODE:</span>
                    <span className="hint-sequence">
                        {recoverySequence.map((symbol, i) => (
                            <span key={i} className="hint-key">{symbol}</span>
                        ))}
                    </span>
                    <span className="hint-instruction">👆 CLICK HERE THEN PRESS ARROW KEYS</span>
                </div>
            )}

            <form className="console-input-area" onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <span className="input-prompt">{isPossessed ? '<' : '>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={corrupted ? corruptText(message, 0.2) : message}
                        onChange={handleInputChange}
                        disabled={isTransmitting}
                        placeholder={corrupted ? '█░▒▓ KEYBOARD REVERSED ▓▒░█' : 'ENTER MESSAGE...'}
                        className={`console-input ${isPossessed ? 'inverted' : ''}`}
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>

                <div className="button-row">
                    <button
                        type="submit"
                        disabled={isTransmitting || !message.trim()}
                        className={`transmit-button ${isTransmitting ? 'transmitting' : ''} ${isPossessed ? 'inverted-btn' : ''}`}
                        style={getButtonStyle()}
                    >
                        {isPossessed
                            ? getDisplayLabel('◆ CLEAR ◆')  // Inverted label!
                            : getDisplayLabel(isTransmitting ? '◌ SENDING ◌' : '◆ TRANSMIT ◆')
                        }
                    </button>

                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={isTransmitting}
                        className={`clear-button ${isPossessed ? 'inverted-btn' : ''}`}
                        style={isPossessed ? getButtonStyle() : {}}
                    >
                        {isPossessed
                            ? getDisplayLabel('◆ TRANSMIT ◆')  // Inverted label!
                            : getDisplayLabel('✕ CLEAR')
                        }
                    </button>
                </div>
            </form>

            {mode === 'possessed' && (
                <div className="recovery-section">
                    <span className="recovery-label">⚡ ENTER RECOVERY SEQUENCE ⚡</span>
                    <div className="recovery-progress">
                        {Array(10).fill(0).map((_, i) => (
                            <span
                                key={i}
                                className={`progress-dot ${i < recoveryProgress * 10 ? 'filled' : ''}`}
                            >
                                {i < recoveryProgress * 10 ? '█' : '░'}
                            </span>
                        ))}
                    </div>
                    <span className="recovery-percent">{Math.round(recoveryProgress * 100)}% COMPLETE</span>
                </div>
            )}

            <div className="console-footer">
                <span>{getDisplayLabel('INTERFACE v1.983')}</span>
                <span>{getDisplayLabel('HAWKINS LAB')}</span>
            </div>
        </div>
    );
};

export default ConsoleUI;
