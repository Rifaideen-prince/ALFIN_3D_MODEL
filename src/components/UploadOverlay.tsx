import React from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadOverlayProps {
  isDragging: boolean;
}

export const UploadOverlay: React.FC<UploadOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="drag-active-overlay" id="drag-drop-overlay">
      <div className="drag-content">
        <UploadCloud size={64} color="#00BFFF" style={{ marginBottom: 12 }} />
        <div className="drag-title">DROP YOUR 3D MODEL HERE</div>
        <div className="drag-subtitle">
          Supported formats: OBJ (.obj), STL (.stl) & companion MTL (.mtl)
        </div>
      </div>
    </div>
  );
};
