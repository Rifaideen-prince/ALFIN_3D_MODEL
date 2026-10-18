import React from 'react';
import { X, Box, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Box size={18} color="#00BFFF" />
            <span>About 3D VISION</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '18px', color: '#F2F5F8', letterSpacing: '1px', marginBottom: 4 }}>
              3D VISION PRO
            </h2>
            <p style={{ color: '#00BFFF', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
              Version 1.0.0 • Engineering CAD & 3D Mesh Inspection Engine
            </p>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#00E58B" /> 100% Client-Side Privacy
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#8A96A5', lineHeight: 1.6 }}>
              All 3D files (OBJ, STL, MTL) are read and parsed entirely locally in your browser using WebGL and Web Workers. Your CAD data and geometry models are never uploaded to any remote server or cloud.
            </p>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={14} color="#00BFFF" /> Supported Capabilities
              </span>
            </div>
            <ul style={{ fontSize: '11px', color: '#8A96A5', paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Wavefront OBJ geometry with multi-mesh and MTL material fallbacks</li>
              <li>Stereolithography STL geometry (both Binary and ASCII formats)</li>
              <li>CAD standard orthographic & perspective projections</li>
              <li>Dynamic geometry statistics (vertices, faces, triangles, bounds, volume)</li>
              <li>Surface wireframe overlays, vertex normals helpers, and bounding boxes</li>
              <li>Smooth camera view transitions and synchronized XYZ orientation gizmo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
