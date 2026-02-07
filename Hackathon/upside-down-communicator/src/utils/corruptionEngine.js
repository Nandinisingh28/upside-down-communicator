// Corruption engine for visual glitches and system instability

/**
 * Generate random glitch offset for UI elements
 * @param {number} intensity - Corruption intensity (0-1)
 * @returns {Object} CSS transform values
 */
export function getGlitchOffset(intensity) {
    const maxOffset = 20 * intensity;
    return {
        x: (Math.random() - 0.5) * maxOffset,
        y: (Math.random() - 0.5) * maxOffset,
        rotation: (Math.random() - 0.5) * intensity * 5
    };
}

/**
 * Generate corrupted color filter
 * @param {number} intensity - Corruption intensity (0-1)
 * @returns {string} CSS filter value
 */
export function getCorruptionFilter(intensity) {
    const hue = Math.random() * 360 * intensity;
    const brightness = 0.8 + Math.random() * 0.4;
    const contrast = 1 + intensity * 0.5;
    const saturate = 1 + intensity * 2;

    return `hue-rotate(${hue}deg) brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
}

/**
 * Generate static noise data for canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Noise intensity (0-1)
 */
export function drawStaticNoise(ctx, width, height, intensity) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255 * intensity;
        const isGreen = Math.random() > 0.7;

        data[i] = isGreen ? 0 : noise;     // R
        data[i + 1] = isGreen ? noise : 0;  // G
        data[i + 2] = 0;                     // B
        data[i + 3] = noise * 0.3;          // A
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Generate scanline effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} offset - Vertical offset for animation
 */
export function drawScanlines(ctx, width, height, offset = 0) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;

    for (let y = offset % 4; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/**
 * Generate corrupted text (character substitution)
 * @param {string} text - Original text
 * @param {number} intensity - Corruption intensity (0-1)
 * @returns {string} Corrupted text
 */
export function corruptText(text, intensity) {
    const glitchChars = '█▓▒░╔╗╚╝║═╬┼┤├▲▼◄►○●□■';

    return text.split('').map(char => {
        if (Math.random() < intensity * 0.3) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
    }).join('');
}

/**
 * Generate random position offset for button corruption
 * @param {number} intensity - Corruption intensity (0-1)
 * @returns {Object} Position offsets
 */
export function getButtonCorruption(intensity) {
    return {
        offsetX: (Math.random() - 0.5) * 100 * intensity,
        offsetY: (Math.random() - 0.5) * 50 * intensity,
        scale: 1 + (Math.random() - 0.5) * 0.2 * intensity,
        opacity: 1 - Math.random() * 0.3 * intensity
    };
}

/**
 * Generate waveform distortion
 * @param {number} baseValue - Original waveform value
 * @param {number} intensity - Distortion intensity (0-1)
 * @returns {number} Distorted value
 */
export function distortWaveform(baseValue, intensity) {
    const noise = (Math.random() - 0.5) * 2 * intensity;
    const spike = Math.random() < intensity * 0.1 ? (Math.random() - 0.5) * 2 : 0;
    return baseValue + noise + spike;
}

/**
 * Recovery code sequence detector with RANDOMIZED sequences
 * Code changes each time you enter possessed mode for extra challenge!
 */
export class KonamiCodeDetector {
    constructor(onSuccess) {
        this.sequence = this.generateRandomSequence();
        this.currentIndex = 0;
        this.onSuccess = onSuccess;
    }

    // Generate a new random recovery sequence each time
    generateRandomSequence() {
        const moves = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const sequence = [];

        // Generate 6-8 random arrow moves
        const length = 6 + Math.floor(Math.random() * 3);
        for (let i = 0; i < length; i++) {
            sequence.push(moves[Math.floor(Math.random() * moves.length)]);
        }

        // Always end with S, T (Stranger Things)
        sequence.push('KeyS', 'KeyT');

        return sequence;
    }

    // Regenerate a new sequence (call when entering possessed mode)
    regenerateSequence() {
        this.sequence = this.generateRandomSequence();
        this.currentIndex = 0;
    }

    handleKey(code) {
        if (code === this.sequence[this.currentIndex]) {
            this.currentIndex++;

            if (this.currentIndex === this.sequence.length) {
                this.currentIndex = 0;
                this.onSuccess();
                return true;
            }
        } else {
            this.currentIndex = 0;
        }

        return false;
    }

    reset() {
        this.currentIndex = 0;
    }

    getProgress() {
        return this.currentIndex / this.sequence.length;
    }

    // Get the full sequence as display-friendly symbols
    getSequenceDisplay() {
        const symbols = {
            'ArrowUp': '▲',
            'ArrowDown': '▼',
            'ArrowLeft': '◀',
            'ArrowRight': '▶',
            'KeyS': 'S',
            'KeyT': 'T'
        };
        return this.sequence.map(key => symbols[key] || key);
    }

    // Get current sequence length
    getSequenceLength() {
        return this.sequence.length;
    }
}
