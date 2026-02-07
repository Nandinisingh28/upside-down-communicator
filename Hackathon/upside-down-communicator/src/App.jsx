import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConsoleUI from './components/ConsoleUI';
import SignalDisplay from './components/SignalDisplay';
import WaveformCanvas from './components/WaveformCanvas';
import SanityMeter from './components/SanityMeter';
import CorruptionOverlay from './components/CorruptionOverlay';
import SignalStrengthMeter from './components/SignalStrengthMeter';
import VoltageMeter from './components/VoltageMeter';
import SpectrumAnalyzer from './components/SpectrumAnalyzer';
import FrequencyDial from './components/FrequencyDial';
import TemperatureMeter from './components/TemperatureMeter';
import LevelPopup from './components/LevelPopup';
import LayerIndicator from './components/LayerIndicator';
import QuickActions from './components/QuickActions';
import TransmissionLog from './components/TransmissionLog';
import { encodeMessage, getSignalDuration, getCurrentSignal, SIGNAL } from './utils/encoder';
import { KonamiCodeDetector } from './utils/corruptionEngine';
import { initAudio, playDot, playDash, resumeAudio, playCorruptionBurst } from './utils/audioEngine';
import { generateLocationData } from './utils/hiddenEncoder';
import { checkTrigger, getEasterEggEffect, applyVisualEffect } from './utils/easterEggs';
import './App.css';

function App() {
  // Application state
  const [mode, setMode] = useState('normal'); // normal, transmitting, corrupted, possessed, recovered
  const [sanityLevel, setSanityLevel] = useState(100);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [encodedSignal, setEncodedSignal] = useState([]);
  const [currentSignal, setCurrentSignal] = useState(null);
  const [recoveryProgress, setRecoveryProgress] = useState(0);

  // Hardware dashboard state
  const [frequency, setFrequency] = useState(600);
  const [voltage, setVoltage] = useState(50);
  const [signalStrength, setSignalStrength] = useState(0);
  const [frequencyStatus, setFrequencyStatus] = useState('stable');
  const [temperature, setTemperature] = useState(30);
  const [isOverheating, setIsOverheating] = useState(false);
  const [hiddenLayerEnabled, setHiddenLayerEnabled] = useState(true);
  const [hiddenMessage, setHiddenMessage] = useState('');
  const [activeEasterEgg, setActiveEasterEgg] = useState(null);
  const [recoverySequence, setRecoverySequence] = useState([]);
  const [recoveryStage, setRecoveryStage] = useState(0); // 0: Normal, 1: Possessed, 2: Frequency Fixed, 3: Power Fixed
  const [showLevelPopup, setShowLevelPopup] = useState(null);
  const [powerLevel, setPowerLevel] = useState(1);
  const [lastMessage, setLastMessage] = useState('');

  // Refs
  const transmissionStartRef = useRef(null);
  const konamiDetectorRef = useRef(null);
  const lastPlayedSignalRef = useRef(-1);
  const possessedTimeoutRef = useRef(null);
  const recoveryStageRef = useRef(0);

  // Update ref when state changes
  useEffect(() => {
    recoveryStageRef.current = recoveryStage;
  }, [recoveryStage]);

  // Initialize Konami code detector

  // Main Effect: Detector Init + Stage Monitoring
  useEffect(() => {
    // Initialize Detector
    konamiDetectorRef.current = new KonamiCodeDetector(() => {
      // Check current stage from ref to avoid stale closures
      if (recoveryStageRef.current < 3) return;

      setMode(currentMode => {
        if (currentMode === 'possessed') {
          setTimeout(() => {
            setMode('normal');
            setRecoveryStage(0);
          }, 3000);
          setRecoveryProgress(0);
          setSanityLevel(100);
          setShowLevelPopup(3); // Stage 3 Complete
          return 'recovered';
        }
        return currentMode;
      });
    });

    // Stage Monitoring Logic
    if (mode === 'possessed') {
      // Stage 1 -> 2: Frequency tuning to 600Hz (allow small margin)
      if (recoveryStage === 1 && frequency >= 590 && frequency <= 610) {
        setRecoveryStage(2);
        setShowLevelPopup(1);
      }

      // Stage 2 -> 3: Power level to max (index 3)
      if (recoveryStage === 2 && powerLevel === 3) {
        setRecoveryStage(3);
        setShowLevelPopup(2);
        // Regenerate sequence when reaching final stage
        if (konamiDetectorRef.current) {
          konamiDetectorRef.current.regenerateSequence();
          setRecoverySequence(konamiDetectorRef.current.getSequenceDisplay());
        }
      }
    }

    // Sync sequence: only show in Stage 3
    if (mode === 'possessed' && recoveryStage === 3) {
      // Sequence is set logic above or persists
    } else {
      setRecoverySequence([]);
    }

    const handleKeyDown = (e) => {
      // Only allow input in Stage 3
      if (mode === 'possessed' && recoveryStage < 3) return;

      if (konamiDetectorRef.current) {
        konamiDetectorRef.current.handleKey(e.code);
        setRecoveryProgress(konamiDetectorRef.current.getProgress());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, recoveryStage, frequency, powerLevel]);

  // Sanity drain over time
  useEffect(() => {
    if (mode === 'possessed' || mode === 'recovered') return;

    const drainInterval = setInterval(() => {
      setSanityLevel(prev => {
        const drainRate = isTransmitting ? 2 : 0.5;
        const newLevel = Math.max(0, prev - drainRate);

        // Trigger corruption burst sounds occasionally
        if (newLevel < 30 && Math.random() > 0.9) {
          playCorruptionBurst();
        }

        return newLevel;
      });
    }, 1000);

    return () => clearInterval(drainInterval);
  }, [mode, isTransmitting]);

  // Check for possessed mode trigger
  useEffect(() => {
    if (sanityLevel <= 0 && mode !== 'possessed' && mode !== 'recovered') {
      setMode('possessed');
      setRecoveryStage(1); // Start at Stage 1

      // Auto-recover after 30 seconds if user doesn't enter code
      possessedTimeoutRef.current = setTimeout(() => {
        if (mode === 'possessed') {
          setMode('normal');
          setSanityLevel(30);
        }
      }, 30000);
    }

    return () => {
      if (possessedTimeoutRef.current) {
        clearTimeout(possessedTimeoutRef.current);
      }
    };
  }, [sanityLevel, mode]);

  // Hardware dashboard effects (signal strength and voltage)
  useEffect(() => {
    const OPTIMAL_FREQ = 600;
    const HIDDEN_FREQUENCIES = [333, 666, 777];

    const updateInterval = setInterval(() => {
      // Calculate frequency penalty
      const freqDiff = Math.abs(frequency - OPTIMAL_FREQ);
      let freqMultiplier = 1;

      if (HIDDEN_FREQUENCIES.includes(frequency)) {
        freqMultiplier = 0.6; // Hidden frequencies have special effects
      } else if (freqDiff <= 20) {
        freqMultiplier = 1; // Optimal
      } else if (freqDiff <= 100) {
        freqMultiplier = 0.7; // Partial signal loss
      } else if (freqDiff <= 200) {
        freqMultiplier = 0.4; // Ghost transmissions
      } else {
        freqMultiplier = 0.2; // Heavy corruption
      }

      // Update signal strength based on transmission state, sanity, and frequency
      setSignalStrength(prev => {
        let target;
        if (isTransmitting) {
          target = (70 + Math.random() * 30) * freqMultiplier;
        } else {
          target = 10 + Math.random() * 10;
        }

        // Corrupted mode affects signal
        if (mode === 'possessed') {
          target = Math.random() * 100;
        }

        // Add noise for off-frequency
        if (freqDiff > 100 && isTransmitting) {
          target += (Math.random() - 0.5) * 30;
        }

        return prev + (target - prev) * 0.2;
      });

      // Update voltage based on activity and frequency
      setVoltage(prev => {
        let target;
        if (isTransmitting) {
          target = 60 + Math.random() * 25;
          // High frequency increases voltage load
          if (frequency > 700) {
            target += 15;
          }
        } else {
          target = 45 + Math.random() * 10;
        }

        // Corrupted mode causes voltage spikes
        if (mode === 'possessed') {
          target = 30 + Math.random() * 60;
        }

        return prev + (target - prev) * 0.15;
      });

      // Update frequency status
      if (HIDDEN_FREQUENCIES.includes(frequency)) {
        setFrequencyStatus('hidden');
      } else if (freqDiff <= 20) {
        setFrequencyStatus('stable');
      } else if (freqDiff <= 100) {
        setFrequencyStatus('warning');
      } else {
        setFrequencyStatus('danger');
      }
    }, 100);

    return () => clearInterval(updateInterval);
  }, [isTransmitting, mode, frequency]);

  // Temperature/overheat mechanic
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setTemperature(prev => {
        let change = 0;

        // Base cooling rate when idle
        if (!isTransmitting) {
          change = -1;
        } else {
          // Heat up during transmission
          change = 2;

          // High frequency = more heat
          if (frequency > 700) {
            change += 1;
          }
        }

        // Corruption causes additional heat
        if (mode === 'possessed' || sanityLevel < 30) {
          change += 2;
        }

        // Venting rapidly cools
        if (isOverheating) {
          change = -5;
        }

        const newTemp = Math.max(20, Math.min(100, prev + change));

        // Check for shutdown at 100°C
        if (newTemp >= 100 && !isOverheating) {
          // Force stop transmission
          setIsTransmitting(false);
          setIsOverheating(true);

          // Auto-recover after venting
          setTimeout(() => {
            setIsOverheating(false);
          }, 5000);
        }

        return newTemp;
      });
    }, 1000);

    return () => clearInterval(tempInterval);
  }, [isTransmitting, mode, frequency, sanityLevel, isOverheating]);

  // Handle VENT SYSTEM
  const handleVentSystem = useCallback(() => {
    setIsOverheating(true);

    // Rapid cooling for 3 seconds
    setTimeout(() => {
      setIsOverheating(false);
      setTemperature(30);
    }, 3000);
  }, []);

  // Signal transmission animation
  useEffect(() => {
    if (!isTransmitting || encodedSignal.length === 0) return;

    const totalDuration = getSignalDuration(encodedSignal);
    let animationFrame;

    const animate = () => {
      const elapsed = Date.now() - transmissionStartRef.current;

      if (elapsed >= totalDuration) {
        setIsTransmitting(false);
        setCurrentSignal(null);
        setEncodedSignal([]);
        lastPlayedSignalRef.current = -1;
        return;
      }

      const signal = getCurrentSignal(encodedSignal, elapsed);
      setCurrentSignal(signal);

      // Play audio for new signals
      if (signal.index !== lastPlayedSignalRef.current && signal.signal) {
        lastPlayedSignalRef.current = signal.index;
        const corrupted = mode === 'possessed' || sanityLevel < 30;

        if (signal.signal.type === SIGNAL.DOT) {
          playDot(corrupted);
        } else if (signal.signal.type === SIGNAL.DASH) {
          playDash(corrupted);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isTransmitting, encodedSignal, mode, sanityLevel]);

  // Handle message transmission
  const handleTransmit = useCallback((message) => {
    // Initialize audio on first interaction
    initAudio();
    resumeAudio();

    // Check for easter egg triggers BEFORE encoding
    const trigger = checkTrigger(message);
    if (trigger) {
      const effect = getEasterEggEffect(trigger.trigger);
      if (effect) {
        setActiveEasterEgg(trigger.trigger);

        // Apply visual effects
        applyVisualEffect(effect, () => {
          setActiveEasterEgg(null);
        });

        // Apply special effects based on trigger
        if (effect.sanityBoost) {
          setSanityLevel(prev => Math.min(100, prev + effect.sanityBoost));
        }

        if (effect.corruption?.forcePossess) {
          setMode('possessed');
          setSanityLevel(0);
          setRecoveryStage(1);
        }

        if (effect.corruption?.clearCorruption) {
          setMode('normal');
          setSanityLevel(prev => Math.min(100, prev + 30));
        }
      }
    }

    // Encode the message
    const signals = encodeMessage(message);
    setEncodedSignal(signals);
    setIsTransmitting(true);
    transmissionStartRef.current = Date.now();
    lastPlayedSignalRef.current = -1;

    // Track the message for transmission log
    setLastMessage(message);

    // Generate hidden layer message
    if (hiddenLayerEnabled) {
      setHiddenMessage(generateLocationData());
    }

    // Set mode to transmitting if not already corrupted
    if (mode === 'normal') {
      setMode('transmitting');
    }
  }, [mode, hiddenLayerEnabled]);

  // Emergency shutdown handler
  const handleEmergencyShutdown = useCallback(() => {
    setIsTransmitting(false);
    setEncodedSignal([]);
    setCurrentSignal(null);
    setMode('normal');
  }, []);

  // Determine if corruption effects should be active
  const isCorrupted = mode === 'possessed' || sanityLevel < 30;

  return (
    <div className={`app ${mode === 'possessed' ? 'possessed' : ''}`}>
      {/* Level Popup */}
      {showLevelPopup && (
        <LevelPopup
          stage={showLevelPopup}
          onComplete={() => setShowLevelPopup(null)}
        />
      )}

      {/* CRT screen effect overlay */}
      <div className="crt-overlay" />

      {/* Main header */}
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">◆</span>
          UPSIDE DOWN COMMUNICATOR
          <span className="title-icon">◆</span>
        </h1>
        <div className="app-subtitle">
          INTERDIMENSIONAL SIGNAL TRANSMISSION SYSTEM v1.983
        </div>
      </header>

      {/* Main content grid */}
      <main className="app-main">
        <div className="left-panel">
          {/* Sanity Meter */}
          <SanityMeter level={sanityLevel} mode={mode} />

          {/* Console UI */}
          <ConsoleUI
            onTransmit={handleTransmit}
            isTransmitting={isTransmitting}
            mode={mode}
            corrupted={isCorrupted}
            recoveryProgress={recoveryProgress}
            isPossessed={mode === 'possessed'}
            recoverySequence={recoverySequence}
            recoveryStage={recoveryStage}
          />

          {/* Quick Actions */}
          <QuickActions
            onQuickTransmit={handleTransmit}
            isTransmitting={isTransmitting}
            corrupted={isCorrupted}
            powerLevel={powerLevel}
            onPowerChange={setPowerLevel}
            onEmergencyShutdown={handleEmergencyShutdown}
          />

          {/* Frequency Dial */}
          <FrequencyDial
            frequency={frequency}
            onFrequencyChange={setFrequency}
            corrupted={isCorrupted}
            disabled={isTransmitting}
          />

          {/* Transmission Log */}
          <TransmissionLog
            currentMessage={lastMessage}
            isTransmitting={isTransmitting}
            corrupted={isCorrupted}
          />
        </div>

        <div className="right-panel">
          {/* Signal Display */}
          <SignalDisplay
            currentSignal={currentSignal}
            isTransmitting={isTransmitting}
            corrupted={isCorrupted}
          />

          {/* Waveform Canvas */}
          <WaveformCanvas
            currentSignal={currentSignal}
            isTransmitting={isTransmitting}
            corrupted={isCorrupted}
          />

          {/* Hardware Dashboard */}
          <div className="dashboard-grid">
            <SignalStrengthMeter
              strength={signalStrength}
              corrupted={isCorrupted}
            />
            <VoltageMeter
              voltage={voltage}
              corrupted={isCorrupted}
            />
            <TemperatureMeter
              temperature={temperature}
              corrupted={isCorrupted}
              isOverheating={isOverheating}
              onVentSystem={handleVentSystem}
            />
          </div>

          {/* Spectrum Analyzer */}
          <SpectrumAnalyzer
            frequency={frequency}
            isActive={isTransmitting}
            corrupted={isCorrupted}
            signalStrength={signalStrength}
          />

          {/* Layer Indicator */}
          <LayerIndicator
            layerAActive={isTransmitting}
            layerBActive={isTransmitting && hiddenLayerEnabled}
            hiddenMessage={hiddenMessage}
            corrupted={isCorrupted}
          />

          {/* Status panel */}
          <div className={`status-panel ${isCorrupted ? 'corrupted' : ''}`}>
            <div className="status-row">
              <span className="status-label">TRANSMISSION:</span>
              <span className={`status-value ${isTransmitting ? 'active' : ''}`}>
                {isTransmitting ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">INTERFERENCE:</span>
              <span className={`status-value ${sanityLevel < 50 ? 'warning' : ''}`}>
                {sanityLevel > 70 ? 'LOW' : sanityLevel > 40 ? 'MODERATE' : 'HIGH'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">DIMENSION LINK:</span>
              <span className={`status-value ${mode === 'possessed' ? 'critical' : ''}`}>
                {mode === 'possessed' ? 'SEVERED' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span>HAWKINS NATIONAL LABORATORY</span>
        <span>◆ CLASSIFIED ◆</span>
        <span>1983</span>
      </footer>

      {/* Corruption overlay */}
      <CorruptionOverlay
        active={mode === 'possessed'}
        intensity={1}
      />

      {/* SYSTEM PURGED Modal */}
      {mode === 'recovered' && (
        <div className="recovery-modal">
          <div className="recovery-modal-content">
            <div className="recovery-icon">✓</div>
            <h2 className="recovery-title">SYSTEM PURGED</h2>
            <p className="recovery-subtitle">REALITY STABILIZED</p>
            <p className="recovery-subtitle">LINK RESTORED</p>
            <div className="recovery-bar">████████████████████</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
