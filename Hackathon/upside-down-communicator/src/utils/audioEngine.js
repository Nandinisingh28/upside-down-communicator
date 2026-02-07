// Audio engine for morse code beeps using Web Audio API

let audioContext = null;
let oscillator = null;
let gainNode = null;

/**
 * Initialize the audio context (must be called after user interaction)
 */
export function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Play a beep sound
 * @param {number} duration - Duration in milliseconds
 * @param {number} frequency - Frequency in Hz (default 600Hz for classic morse tone)
 * @param {boolean} corrupted - Whether to add corruption effects
 */
export function playBeep(duration, frequency = 600, corrupted = false) {
    if (!audioContext) initAudio();

    // Create oscillator
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    // Add corruption: randomize frequency slightly
    const actualFreq = corrupted
        ? frequency + (Math.random() - 0.5) * 200
        : frequency;

    oscillator.type = 'square'; // Square wave for classic beep sound
    oscillator.frequency.setValueAtTime(actualFreq, audioContext.currentTime);

    // Set volume
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    // Add slight fade out for cleaner sound
    gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
    );

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);

    // Add static noise if corrupted
    if (corrupted) {
        playStaticNoise(duration / 2);
    }
}

/**
 * Play static noise for corruption effect
 * @param {number} duration - Duration in milliseconds
 */
export function playStaticNoise(duration) {
    if (!audioContext) initAudio();

    const bufferSize = audioContext.sampleRate * (duration / 1000);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
}

/**
 * Play a dot beep (short)
 */
export function playDot(corrupted = false) {
    playBeep(200, 600, corrupted);
}

/**
 * Play a dash beep (long)
 */
export function playDash(corrupted = false) {
    playBeep(600, 600, corrupted);
}

/**
 * Resume audio context if suspended
 */
export function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Play corruption static burst
 */
export function playCorruptionBurst() {
    if (!audioContext) initAudio();

    playStaticNoise(100 + Math.random() * 200);
}
