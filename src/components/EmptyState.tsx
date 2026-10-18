import React from 'react';
import { Box, UploadCloud, Cpu, Layers } from 'lucide-react';

interface EmptyStateProps {
  onOpenModelClick: () => void;
  onLoadSampleObj: () => void;
  onLoadSampleStl: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenModelClick,
  onLoadSampleObj,
  onLoadSampleStl,
}) => {
  return (
    <div className="empty-state-overlay" id="empty-state-view">
      <div className="empty-state-card">
        <Box className="empty-state-icon" strokeWidth={1.5} />
        
        <h1 className="empty-state-title">3D VISION</h1>
        <p className="empty-state-subtitle">
          Professional CAD & 3D Mesh Inspection Engine
        </p>

        <div className="dropzone-box" onClick={onOpenModelClick} id="empty-state-dropzone">
          <UploadCloud size={32} color="#00BFFF" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#F2F5F8', fontWeight: 600, marginBottom: 4 }}>
              Drag and drop an OBJ or STL file here
            </div>
            <div className="dropzone-text">
              or click to browse your computer (.obj, .stl)
            </div>
          </div>
          <button
            className="btn-upload-primary"
            style={{ marginTop: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenModelClick();
            }}
          >
            OPEN 3D MODEL
          </button>
        </div>

        <div className="sample-models-row">
          <span className="sample-row-label">Or test with bundled CAD samples:</span>
          <div className="sample-btn-group">
            <button
              className="sample-btn"
              onClick={onLoadSampleObj}
              title="Load sample mechanical bracket OBJ model"
              id="btn-sample-obj"
            >
              <Cpu size={14} color="#00BFFF" />
              <span>Sample Bracket (.obj)</span>
            </button>
            <button
              className="sample-btn"
              onClick={onLoadSampleStl}
              title="Load sample calibration cube STL model"
              id="btn-sample-stl"
            >
              <Layers size={14} color="#00E58B" />
              <span>Calibration Cube (.stl)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
