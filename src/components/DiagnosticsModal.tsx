import React from 'react';
import { X, Activity } from 'lucide-react';
import { DiagnosticsInfo } from '../types/viewer';

interface DiagnosticsModalProps {
  isOpen: boolean;
  diagnostics: DiagnosticsInfo;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  diagnostics,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Activity size={18} color="#00BFFF" />
            <span>WebGL Engine Diagnostics</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="drawer-section">
            <div className="drawer-section-title">Rendering Performance</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Frame Rate</span>
                <span className="info-value" style={{ color: '#00E58B' }}>{diagnostics.fps} FPS</span>
              </div>
              <div className="info-item">
                <span className="info-label">Frame Time</span>
                <span className="info-value">{diagnostics.frameTimeMs.toFixed(2)} ms</span>
              </div>
              <div className="info-item">
                <span className="info-label">Draw Calls</span>
                <span className="info-value">{diagnostics.renderCalls}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rendered Triangles</span>
                <span className="info-value">{diagnostics.renderTriangles.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">GPU Memory & Allocation</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Allocated Geometries</span>
                <span className="info-value">{diagnostics.memoryGeometries}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Allocated Textures</span>
                <span className="info-value">{diagnostics.memoryTextures}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rendered Lines</span>
                <span className="info-value">{diagnostics.renderLines}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rendered Points</span>
                <span className="info-value">{diagnostics.renderPoints}</span>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Hardware Context</div>
            <div className="info-grid">
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">GPU Renderer</span>
                <span className="info-value" style={{ fontSize: '10px' }}>
                  {diagnostics.rendererRenderer || 'WebGL 2.0 (DirectX / Vulkan / Metal)'}
                </span>
              </div>
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Vendor</span>
                <span className="info-value" style={{ fontSize: '10px' }}>
                  {diagnostics.rendererVendor || 'Browser WebGL Implementation'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
