import React from 'react';
import './LayerIndicator.css';

function LayerIndicator({
    layerAActive = false,
    layerBActive = false,
    hiddenMessage = '',
    corrupted = false
}) {
    const getStatusClass = () => {
        if (corrupted) return 'corrupted';
        if (layerAActive && layerBActive) return 'dual';
        if (layerAActive) return 'layer-a';
        if (layerBActive) return 'layer-b';
        return 'inactive';
    };

    const getStatusText = () => {
        if (corrupted) return 'CORRUPTED';
        if (layerAActive && layerBActive) return 'DUAL-LAYER';
        if (layerAActive) return 'LAYER A';
        if (layerBActive) return 'LAYER B';
        return 'STANDBY';
    };

    return (
        <div className={`layer-indicator ${getStatusClass()}`}>
            <div className="layer-header">
                <span className="layer-icon">◆</span>
                <span className="layer-title">TRANSMISSION LAYERS</span>
            </div>

            <div className="layers-grid">
                <div className={`layer layer-a ${layerAActive ? 'active' : ''}`}>
                    <div className="layer-led" />
                    <span className="layer-label">LAYER A</span>
                    <span className="layer-desc">PRIMARY SIGNAL</span>
                </div>

                <div className={`layer layer-b ${layerBActive ? 'active' : ''}`}>
                    <div className="layer-led" />
                    <span className="layer-label">LAYER B</span>
                    <span className="layer-desc">HIDDEN CHANNEL</span>
                </div>
            </div>

            {layerBActive && hiddenMessage && (
                <div className="hidden-message">
                    <span className="hidden-label">HIDDEN:</span>
                    <span className="hidden-content">{hiddenMessage}</span>
                </div>
            )}

            <div className="layer-status">
                <span className="status-dot" />
                <span>{getStatusText()}</span>
            </div>
        </div>
    );
}

export default LayerIndicator;
