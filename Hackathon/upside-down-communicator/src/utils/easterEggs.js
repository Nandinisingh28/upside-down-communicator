/**
 * Easter Eggs - Hidden Dimension Triggers
 * Special encoded phrases that unlock hidden behaviors and effects
 */

// Trigger phrases (case-insensitive)
const TRIGGERS = {
    OPEN_GATE: 'OPEN GATE',
    RUN: 'RUN',
    HELLO_UPSIDE: 'HELLO FROM UPSIDE',
    ELEVEN: 'ELEVEN',
    DEMOGORGON: 'DEMOGORGON',
    WILL: 'WILL',
    HAWKINS: 'HAWKINS',
    FRIENDS: 'FRIENDS DONT LIE'
};

// Effect durations in milliseconds
const EFFECT_DURATIONS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 20000
};

/**
 * Check if input matches any trigger phrases
 * @param {string} input - User input text
 * @returns {object|null} - Trigger info or null
 */
export function checkTrigger(input) {
    const normalizedInput = input.toUpperCase().trim();

    for (const [key, phrase] of Object.entries(TRIGGERS)) {
        if (normalizedInput.includes(phrase)) {
            return {
                trigger: key,
                phrase
            };
        }
    }

    return null;
}

/**
 * Get effect configuration for a trigger
 * @param {string} trigger - Trigger key
 * @returns {object} - Effect configuration
 */
export function getEasterEggEffect(trigger) {
    const effects = {
        OPEN_GATE: {
            name: 'Portal Opening',
            duration: EFFECT_DURATIONS.LONG,
            visual: {
                overlay: 'portal',
                colorShift: '#ff00ff',
                screenShake: true,
                glitchIntensity: 0.8
            },
            audio: {
                playSound: 'gate_open',
                distortTransmission: true
            },
            corruption: {
                theme: 'upside_down',
                instant: true
            },
            message: '>>> GATE SEQUENCE INITIATED <<<'
        },

        RUN: {
            name: 'Chase Sequence',
            duration: EFFECT_DURATIONS.MEDIUM,
            visual: {
                overlay: 'chase',
                colorShift: '#ff0040',
                screenShake: true,
                glitchIntensity: 1.0,
                rapidFlash: true
            },
            audio: {
                playSound: 'monster_roar',
                heartbeat: true
            },
            corruption: {
                theme: 'danger',
                instant: false
            },
            message: '>>> THEY ARE COMING <<<'
        },

        HELLO_UPSIDE: {
            name: 'Upside Down Response',
            duration: EFFECT_DURATIONS.LONG,
            visual: {
                overlay: 'static',
                colorShift: '#00ffff',
                invertColors: true,
                glitchIntensity: 0.5
            },
            audio: {
                playSound: 'whisper',
                reverseAudio: true
            },
            corruption: {
                theme: 'inverted',
                instant: false
            },
            message: '>>> EDISPU EHT MORF OLLEH <<<',
            secretTransmission: 'WE CAN HEAR YOU NOW'
        },

        ELEVEN: {
            name: 'Power Boost',
            duration: EFFECT_DURATIONS.MEDIUM,
            visual: {
                overlay: 'power',
                colorShift: '#ffffff',
                glowIntensity: 1.0,
                glitchIntensity: 0.2
            },
            audio: {
                playSound: 'power_surge'
            },
            corruption: {
                theme: 'none',
                instant: false
            },
            sanityBoost: 50,
            message: '>>> PSYCHIC LINK ESTABLISHED <<<'
        },

        DEMOGORGON: {
            name: 'Entity Summoning',
            duration: EFFECT_DURATIONS.SHORT,
            visual: {
                overlay: 'monster',
                colorShift: '#330000',
                screenShake: true,
                glitchIntensity: 1.0,
                blackout: true
            },
            audio: {
                playSound: 'monster_screech',
                distortAll: true
            },
            corruption: {
                theme: 'possessed',
                instant: true,
                forcePossess: true
            },
            message: '>>> YOU SHOULD NOT HAVE DONE THAT <<<'
        },

        WILL: {
            name: 'Will Byers Signal',
            duration: EFFECT_DURATIONS.MEDIUM,
            visual: {
                overlay: 'lights',
                colorShift: '#ffff00',
                flickerLights: true,
                glitchIntensity: 0.3
            },
            audio: {
                playSound: 'morse_reply'
            },
            corruption: {
                theme: 'none',
                instant: false
            },
            secretTransmission: 'RIGHT HERE',
            message: '>>> MESSAGE RECEIVED FROM THE OTHER SIDE <<<'
        },

        HAWKINS: {
            name: 'Lab Connection',
            duration: EFFECT_DURATIONS.MEDIUM,
            visual: {
                overlay: 'lab',
                colorShift: '#00ff00',
                scanlines: true,
                glitchIntensity: 0.4
            },
            audio: {
                playSound: 'radio_static'
            },
            corruption: {
                theme: 'interference',
                instant: false
            },
            message: '>>> HAWKINS LAB UPLINK ACTIVE <<<'
        },

        FRIENDS: {
            name: 'Friendship Power',
            duration: EFFECT_DURATIONS.MEDIUM,
            visual: {
                overlay: 'glow',
                colorShift: '#00ff88',
                warmGlow: true,
                glitchIntensity: 0
            },
            audio: {
                playSound: 'hope'
            },
            corruption: {
                theme: 'clear',
                clearCorruption: true
            },
            sanityBoost: 30,
            message: '>>> BOND STRENGTHENED <<<'
        }
    };

    return effects[trigger] || null;
}

/**
 * Apply visual effect to the DOM
 * @param {object} effect - Effect configuration
 * @param {function} onComplete - Callback when effect ends
 */
export function applyVisualEffect(effect, onComplete) {
    const { visual, duration } = effect;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = `easter-egg-overlay ${visual.overlay}`;
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    animation: easterEggFade ${duration}ms ease-out forwards;
  `;

    // Add color shift
    if (visual.colorShift) {
        overlay.style.backgroundColor = visual.colorShift;
        overlay.style.opacity = '0.3';
        overlay.style.mixBlendMode = 'overlay';
    }

    // Add screen shake
    if (visual.screenShake) {
        document.body.classList.add('screen-shake');
    }

    // Add rapid flash
    if (visual.rapidFlash) {
        overlay.classList.add('rapid-flash');
    }

    // Add to DOM
    document.body.appendChild(overlay);

    // Cleanup
    setTimeout(() => {
        overlay.remove();
        document.body.classList.remove('screen-shake');
        if (onComplete) onComplete();
    }, duration);

    return overlay;
}

/**
 * Get all available trigger phrases
 */
export function getTriggerList() {
    return Object.values(TRIGGERS);
}

/**
 * Check if message reveals a secret
 */
export function hasSecretTransmission(trigger) {
    const effect = getEasterEggEffect(trigger);
    return effect?.secretTransmission || null;
}
