import { morseMap } from './morseMap';

// Signal types
export const SIGNAL = {
    DOT: 'dot',
    DASH: 'dash',
    CHAR_GAP: 'char_gap',
    WORD_GAP: 'word_gap'
};

// Timing constants (in milliseconds)
export const TIMING = {
    DOT: 200,
    DASH: 600,
    INTRA_CHAR: 200,  // Gap between dots/dashes in same character
    CHAR_GAP: 600,    // Gap between characters
    WORD_GAP: 1400    // Gap between words
};

/**
 * Encode a text message into a signal array
 * @param {string} message - The message to encode
 * @returns {Array} Array of signal objects with type and duration
 */
export function encodeMessage(message) {
    const signals = [];
    const upperMessage = message.toUpperCase();

    for (let i = 0; i < upperMessage.length; i++) {
        const char = upperMessage[i];
        const morse = morseMap[char];

        if (!morse) continue;

        if (morse === '/') {
            // Word gap (space character)
            signals.push({ type: SIGNAL.WORD_GAP, duration: TIMING.WORD_GAP });
        } else {
            // Process each dot/dash in the morse pattern
            for (let j = 0; j < morse.length; j++) {
                const symbol = morse[j];

                if (symbol === '.') {
                    signals.push({ type: SIGNAL.DOT, duration: TIMING.DOT });
                } else if (symbol === '-') {
                    signals.push({ type: SIGNAL.DASH, duration: TIMING.DASH });
                }

                // Add intra-character gap (except after last symbol)
                if (j < morse.length - 1) {
                    signals.push({ type: SIGNAL.CHAR_GAP, duration: TIMING.INTRA_CHAR });
                }
            }

            // Add character gap (except after last character or before space)
            if (i < upperMessage.length - 1 && upperMessage[i + 1] !== ' ') {
                signals.push({ type: SIGNAL.CHAR_GAP, duration: TIMING.CHAR_GAP });
            }
        }
    }

    return signals;
}

/**
 * Get the total duration of a signal sequence
 * @param {Array} signals - Array of signal objects
 * @returns {number} Total duration in milliseconds
 */
export function getSignalDuration(signals) {
    return signals.reduce((total, signal) => total + signal.duration, 0);
}

/**
 * Get the current signal index based on elapsed time
 * @param {Array} signals - Array of signal objects
 * @param {number} elapsed - Elapsed time in milliseconds
 * @returns {Object} Current signal index and whether it's active
 */
export function getCurrentSignal(signals, elapsed) {
    let accumulatedTime = 0;

    for (let i = 0; i < signals.length; i++) {
        const signal = signals[i];
        const signalEnd = accumulatedTime + signal.duration;

        if (elapsed < signalEnd) {
            return {
                index: i,
                signal: signal,
                progress: (elapsed - accumulatedTime) / signal.duration,
                isActive: signal.type === SIGNAL.DOT || signal.type === SIGNAL.DASH
            };
        }

        accumulatedTime = signalEnd;
    }

    return { index: -1, signal: null, progress: 1, isActive: false };
}
