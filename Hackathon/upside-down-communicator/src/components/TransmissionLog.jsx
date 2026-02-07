import React, { useState, useEffect } from 'react';
import './TransmissionLog.css';

function TransmissionLog({ currentMessage, isTransmitting, corrupted }) {
    const [logs, setLogs] = useState([
        { time: '00:00:00', message: 'SYSTEM INITIALIZED', type: 'system' },
        { time: '00:00:01', message: 'DIMENSIONAL LINK ACTIVE', type: 'system' },
    ]);

    // Add new log when transmission starts
    useEffect(() => {
        if (isTransmitting && currentMessage) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

            setLogs(prev => {
                const newLogs = [...prev, {
                    time: timeStr,
                    message: currentMessage.toUpperCase(),
                    type: corrupted ? 'corrupted' : 'normal'
                }];
                // Keep only last 8 logs
                return newLogs.slice(-8);
            });
        }
    }, [isTransmitting, currentMessage, corrupted]);

    // Add random dimensional interference
    useEffect(() => {
        if (!corrupted) return;

        const interferenceMessages = [
            'INTERFERENCE DETECTED',
            'SIGNAL DEGRADATION',
            'ENTITY PROXIMITY WARNING',
            'DIMENSIONAL BREACH NEAR',
        ];

        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

                setLogs(prev => {
                    const newLogs = [...prev, {
                        time: timeStr,
                        message: interferenceMessages[Math.floor(Math.random() * interferenceMessages.length)],
                        type: 'warning'
                    }];
                    return newLogs.slice(-8);
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [corrupted]);

    return (
        <div className={`transmission-log ${corrupted ? 'corrupted' : ''}`}>
            <div className="log-header">
                <span className="log-icon">▣</span>
                <span className="log-title">TRANSMISSION LOG</span>
                <span className="log-count">[{logs.length}]</span>
            </div>

            <div className="log-entries">
                {logs.map((log, index) => (
                    <div key={index} className={`log-entry ${log.type}`}>
                        <span className="log-time">{log.time}</span>
                        <span className="log-separator">│</span>
                        <span className="log-message">{log.message}</span>
                    </div>
                ))}

                {isTransmitting && (
                    <div className="log-entry active">
                        <span className="log-time">NOW</span>
                        <span className="log-separator">│</span>
                        <span className="log-message transmitting">TRANSMITTING...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TransmissionLog;
