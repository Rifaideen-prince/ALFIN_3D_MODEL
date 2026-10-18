import React from 'react';
import { ZoomIn, ZoomOut, Focus, RotateCcw } from 'lucide-react';

interface CameraControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitModel: () => void;
  onResetCamera: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFitModel,
  onResetCamera,
}) => {
  return (
    <div className="floating-camera-tools" id="camera-controls">
      <button
        className="camera-tool-btn"
        onClick={onZoomIn}
        title="Zoom In (+)"
        id="btn-zoom-in"
        aria-label="Zoom In"
      >
        <ZoomIn size={18} />
      </button>

      <button
        className="camera-tool-btn"
        onClick={onZoomOut}
        title="Zoom Out (-)"
        id="btn-zoom-out"
        aria-label="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>

      <button
        className="camera-tool-btn"
        onClick={onFitModel}
        title="Fit Model in Viewport (F)"
        id="btn-fit-model"
        aria-label="Fit Model"
      >
        <Focus size={18} />
      </button>

      <button
        className="camera-tool-btn"
        onClick={onResetCamera}
        title="Reset Camera Position (R)"
        id="btn-reset-camera"
        aria-label="Reset Camera"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
};
