import React from 'react';
import { X, Box, Check, AlertCircle } from 'lucide-react';
import { ModelStats, UnitType } from '../types/viewer';
import { formatCompactNumber, formatExactNumber, formatFileSize, formatDimension } from '../utils/formatters';

interface ModelInfoPanelProps {
  stats: ModelStats | null;
  unit: UnitType;
  showBoundingBox: boolean;
  onClose: () => void;
  onUnitChange: (unit: UnitType) => void;
  onToggleBoundingBox: () => void;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({
  stats,
  unit,
  showBoundingBox,
  onClose,
  onUnitChange,
  onToggleBoundingBox,
}) => {
  return (
    <aside className="side-drawer" id="model-info-drawer">
      <div className="drawer-header">
        <div className="drawer-title">
          <Box size={16} color="#00BFFF" />
          <span>Model Inspection</span>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close panel">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {!stats ? (
          <div style={{ textAlign: 'center', color: '#8A96A5', padding: '32px 0' }}>
            No model loaded. Open an OBJ or STL file to view its technical statistics and geometry dimensions.
          </div>
        ) : (
          <>
            {/* FILE INFORMATION */}
            <div className="drawer-section">
              <div className="drawer-section-title">File Details</div>
              <div className="info-grid">
                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="info-label">Filename</span>
                  <span className="info-value" title={stats.filename}>
                    {stats.filename}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format</span>
                  <span className="info-value">{stats.fileExtension || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">File Size</span>
                  <span className="info-value">{formatFileSize(stats.fileSize)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Parse Time</span>
                  <span className="info-value">{stats.loadTimeMs.toFixed(1)} ms</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value" style={{ color: '#00E58B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Loaded
                  </span>
                </div>
              </div>
            </div>

            {/* GEOMETRY INFORMATION */}
            <div className="drawer-section">
              <div className="drawer-section-title">Mesh & Geometry</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Vertices</span>
                  <span className="info-value">
                    {formatExactNumber(stats.verticesCount)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Triangles</span>
                  <span className="info-value">
                    {formatExactNumber(stats.trianglesCount)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Meshes</span>
                  <span className="info-value">{stats.meshesCount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Materials</span>
                  <span className="info-value">{stats.materialsCount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Normals</span>
                  <span className="info-value">{stats.hasNormals ? 'Available' : 'Computed'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Vertex Colors</span>
                  <span className="info-value">{stats.hasColors ? 'Yes' : 'None'}</span>
                </div>
              </div>
            </div>

            {/* DIMENSIONS */}
            <div className="drawer-section">
              <div className="drawer-section-title">
                <span>Dimensions</span>
                <select
                  value={unit}
                  onChange={(e) => onUnitChange(e.target.value as UnitType)}
                  style={{
                    background: '#151B24',
                    border: '1px solid #202B38',
                    color: '#00BFFF',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Display Unit (Does not alter geometry)"
                >
                  <option value="unit">Model Units</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div style={{ fontSize: '10px', color: '#8A96A5', marginBottom: 4 }}>
                * CAD files do not encode physical units; display units are assumed.
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Width (X)</span>
                  <span className="info-value" style={{ color: '#FF4D4D' }}>
                    {formatDimension(stats.boundingBox.size.x, unit)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Height (Y)</span>
                  <span className="info-value" style={{ color: '#00E58B' }}>
                    {formatDimension(stats.boundingBox.size.y, unit)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Depth (Z)</span>
                  <span className="info-value" style={{ color: '#00BFFF' }}>
                    {formatDimension(stats.boundingBox.size.z, unit)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bounding Box Volume</span>
                  <span className="info-value">
                    {(stats.boundingBox.size.x * stats.boundingBox.size.y * stats.boundingBox.size.z).toFixed(1)} u³
                  </span>
                </div>
              </div>
            </div>

            {/* BOUNDING BOX BOUNDS */}
            <div className="drawer-section">
              <div className="drawer-section-title">
                <span>Bounding Box Extents</span>
                <label className="toggle-switch" title="Toggle 3D Bounding Box visual helper">
                  <input
                    type="checkbox"
                    checked={showBoundingBox}
                    onChange={onToggleBoundingBox}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Min X</span>
                  <span className="info-value">{stats.boundingBox.min.x.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Max X</span>
                  <span className="info-value">{stats.boundingBox.max.x.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Min Y</span>
                  <span className="info-value">{stats.boundingBox.min.y.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Max Y</span>
                  <span className="info-value">{stats.boundingBox.max.y.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Min Z</span>
                  <span className="info-value">{stats.boundingBox.min.z.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Max Z</span>
                  <span className="info-value">{stats.boundingBox.max.z.toFixed(2)}</span>
                </div>
                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="info-label">Center Point (X, Y, Z)</span>
                  <span className="info-value">
                    ({stats.boundingBox.center.x.toFixed(2)}, {stats.boundingBox.center.y.toFixed(2)}, {stats.boundingBox.center.z.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
