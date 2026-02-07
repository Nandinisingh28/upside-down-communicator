/**
 * Entity AI - Adaptive Interference System
 * Simulates intelligent hostile entity behavior during possessed mode
 */

// Entity state
let recoveryAttempts = 0;
let blockedMethods = new Set();
let currentPattern = 'normal';
let lastRecoveryTime = 0;

// Recovery method tracking
const RECOVERY_METHODS = {
    KONAMI: 'konami',
    ELEVEN: 'eleven',
    HOLD_TRANSMIT: 'hold_transmit',
    HIDDEN_FREQUENCY: 'hidden_freq'
};

// Dynamic corruption patterns
const CORRUPTION_PATTERNS = [
    'normal',     // Standard corruption
    'inverse',    // Inverted controls
    'scrambled',  // Random char swapping
    'delayed',    // Input delay
    'echo'        // Text echoes/duplicates
];

/**
 * Reset entity state (called when mode changes to normal)
 */
export function resetEntityState() {
    recoveryAttempts = 0;
    blockedMethods.clear();
    currentPattern = 'normal';
    lastRecoveryTime = 0;
}

/**
 * Record a recovery attempt
 * @param {string} method - The recovery method attempted
 * @returns {object} - Result of the attempt
 */
export function recordRecoveryAttempt(method) {
    recoveryAttempts++;
    lastRecoveryTime = Date.now();

    // Check if method is blocked
    if (blockedMethods.has(method)) {
        return {
            success: false,
            blocked: true,
            message: 'THIS PATH IS CLOSED TO YOU',
            alternateHint: getAlternateRecoveryHint(method)
        };
    }

    // After 3 failed attempts with same method, block it
    if (recoveryAttempts >= 3) {
        blockedMethods.add(method);
        // Change corruption pattern when method is blocked
        currentPattern = CORRUPTION_PATTERNS[Math.floor(Math.random() * CORRUPTION_PATTERNS.length)];

        return {
            success: false,
            blocked: false,
            methodBlocked: true,
            message: 'THE ENTITY LEARNS...',
            newPattern: currentPattern
        };
    }

    return {
        success: true,
        blocked: false,
        message: null
    };
}

/**
 * Get hint for alternate recovery method
 */
function getAlternateRecoveryHint(blockedMethod) {
    const hints = {
        [RECOVERY_METHODS.KONAMI]: 'TRY SPEAKING HER NAME BACKWARDS',
        [RECOVERY_METHODS.ELEVEN]: 'TUNE TO THE FORGOTTEN FREQUENCY',
        [RECOVERY_METHODS.HOLD_TRANSMIT]: 'THE CODE STILL WORKS... FOR NOW',
        [RECOVERY_METHODS.HIDDEN_FREQUENCY]: 'SHE WAITS IN THE PATTERN'
    };

    return hints[blockedMethod] || 'FIND ANOTHER WAY';
}

/**
 * Get current corruption pattern
 */
export function getCurrentPattern() {
    return currentPattern;
}

/**
 * Apply text corruption based on current pattern
 * @param {string} text - Original text
 * @returns {string} - Corrupted text
 */
export function applyEntityCorruption(text) {
    switch (currentPattern) {
        case 'inverse':
            return text.split('').reverse().join('');

        case 'scrambled':
            return text.split('').map(char => {
                if (Math.random() > 0.7) {
                    return String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 10) - 5);
                }
                return char;
            }).join('');

        case 'echo':
            return text.split('').map((char, i) =>
                i % 3 === 0 ? char + char : char
            ).join('');

        case 'delayed':
            // Delay is handled by the component
            return text;

        default:
            return text;
    }
}

/**
 * Generate fake/misleading signal patterns
 */
export function generateFakeSignal() {
    const fakeMessages = [
        'SHE IS HERE',
        'RUN RUN RUN',
        'TOO LATE',
        'I SEE YOU',
        'COME CLOSER',
        'WRONG WAY',
        'NOT REAL',
        'HELP ME'
    ];

    return fakeMessages[Math.floor(Math.random() * fakeMessages.length)];
}

/**
 * Inject fake signal into transmission
 * @param {array} signals - Original encoded signals
 * @param {number} intensity - 0-1 intensity of injection
 * @returns {array} - Signals with fake injections
 */
export function injectFakeSignals(signals, intensity = 0.3) {
    return signals.map((signal, index) => {
        // Random chance to replace with fake signal
        if (Math.random() < intensity) {
            return {
                ...signal,
                corrupted: true,
                fakeData: true
            };
        }
        return signal;
    });
}

/**
 * Get entity behavior based on state
 */
export function getEntityBehavior() {
    return {
        aggression: Math.min(1, recoveryAttempts * 0.2),
        blockedMethods: Array.from(blockedMethods),
        currentPattern,
        isAdapting: recoveryAttempts > 0,
        timeSinceLastAttempt: Date.now() - lastRecoveryTime
    };
}

/**
 * Entity message generator
 * Returns random threatening messages during possessed mode
 */
export function getEntityMessage() {
    const messages = [
        'YOU CANNOT ESCAPE',
        'I AM WITH YOU NOW',
        'THE GATE OPENS WIDER',
        'SHE CALLS YOUR NAME',
        'STOP FIGHTING',
        'JOIN US',
        'IT IS ALREADY TOO LATE',
        'WE ARE EVERYWHERE',
        'THE UPSIDE DOWN WELCOMES YOU',
        'RUN ALL YOU WANT'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Check if alternate recovery is available
 */
export function getAvailableRecoveryMethods() {
    return Object.values(RECOVERY_METHODS).filter(
        method => !blockedMethods.has(method)
    );
}

/**
 * Validate ELEVEN typed backwards (NEVELE)
 */
export function checkElevenRecovery(input) {
    return input.toUpperCase() === 'NEVELE';
}

/**
 * Check for hidden frequency recovery (333, 666, or 777 Hz)
 */
export function checkFrequencyRecovery(frequency) {
    return [333, 666, 777].includes(frequency);
}
