/**
 * Hidden Encoder - Secondary Layer Encoding System
 * Encodes hidden messages using audio frequency variations and brightness patterns
 */

// Hidden layer encoding constants
const BASE_FREQUENCY = 600;
const FREQ_OFFSET = 50; // Hz offset for binary encoding

// Convert text to binary
function textToBinary(text) {
    return text.split('').map(char =>
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
}

// Convert binary to text
function binaryToText(binary) {
    const chars = binary.match(/.{8}/g) || [];
    return chars.map(byte =>
        String.fromCharCode(parseInt(byte, 2))
    ).join('');
}

/**
 * Encode a hidden message for Layer B transmission
 * Returns array of frequency/brightness values synchronized with primary signal
 */
export function encodeHiddenMessage(message, primarySignalLength) {
    const binary = textToBinary(message.toUpperCase());
    const encoded = [];

    // Pad or truncate to match primary signal length
    const targetLength = Math.max(primarySignalLength, binary.length);

    for (let i = 0; i < targetLength; i++) {
        const bit = binary[i % binary.length] || '0';

        encoded.push({
            bit: parseInt(bit),
            // Frequency variation for audio encoding
            frequencyOffset: bit === '1' ? FREQ_OFFSET : -FREQ_OFFSET,
            // Brightness variation (0.5-1.0 range)
            brightness: bit === '1' ? 1.0 : 0.5,
            // Color intensity variation (for LED encoding)
            intensity: bit === '1' ? 1.0 : 0.3,
        });
    }

    return encoded;
}

/**
 * Generate audio frequency pattern for hidden layer
 * Creates an array of frequencies synchronized with transmission timing
 */
export function generateHiddenAudioPattern(hiddenSignal, baseFreq = BASE_FREQUENCY) {
    return hiddenSignal.map(signal => ({
        frequency: baseFreq + signal.frequencyOffset,
        duration: 100, // ms per bit
        amplitude: 0.3 // Lower amplitude than primary
    }));
}

/**
 * Generate brightness pattern for LED encoding
 * Returns array of brightness values (0-1) synchronized with transmission
 */
export function generateBrightnessPattern(hiddenSignal) {
    return hiddenSignal.map(signal => signal.brightness);
}

/**
 * Decode hidden message from received frequencies
 * (For potential future use in multiplayer/receiving mode)
 */
export function decodeHiddenMessage(frequencies, baseFreq = BASE_FREQUENCY) {
    const binary = frequencies.map(freq =>
        freq > baseFreq ? '1' : '0'
    ).join('');

    return binaryToText(binary);
}

/**
 * Generate location data string from coordinates
 * Used for automatic secondary layer content
 */
export function generateLocationData() {
    // Simulated location data (Hawkins Laboratory coordinates)
    const locations = [
        'LAT:39.1N LON:86.5W',
        'SECTOR:7-G DEPTH:40M',
        'GATE:ALPHA STATUS:ACTIVE',
        'PORTAL:UNSTABLE FLUX:HIGH',
        'COORDINATES:CLASSIFIED'
    ];

    return locations[Math.floor(Math.random() * locations.length)];
}

/**
 * Create synchronized dual-layer signal
 * Combines primary Morse encoding with hidden layer data
 */
export function createDualLayerSignal(primarySignals, hiddenMessage = null) {
    // Auto-generate hidden message if not provided
    const actualHiddenMessage = hiddenMessage || generateLocationData();

    // Encode the hidden message
    const hiddenSignal = encodeHiddenMessage(actualHiddenMessage, primarySignals.length);

    // Combine both layers
    return primarySignals.map((primary, index) => ({
        primary,
        hidden: hiddenSignal[index] || hiddenSignal[index % hiddenSignal.length],
        synchronization: {
            startTime: primary.startTime,
            duration: primary.duration
        }
    }));
}

/**
 * Layer indicator states
 */
export const LAYER_STATUS = {
    INACTIVE: 'inactive',
    LAYER_A: 'layer_a_only',
    LAYER_B: 'layer_b_only',
    DUAL: 'dual_layer',
    CORRUPTED: 'corrupted'
};

/**
 * Get layer status based on transmission state
 */
export function getLayerStatus(isTransmitting, hiddenLayerEnabled, corrupted) {
    if (corrupted) return LAYER_STATUS.CORRUPTED;
    if (!isTransmitting) return LAYER_STATUS.INACTIVE;
    if (hiddenLayerEnabled) return LAYER_STATUS.DUAL;
    return LAYER_STATUS.LAYER_A;
}
