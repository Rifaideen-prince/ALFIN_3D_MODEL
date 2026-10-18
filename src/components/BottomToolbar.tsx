import React from 'react';
import { ViewPreset, RenderMode } from '../types/viewer';

interface BottomToolbarProps {
  currentView: ViewPreset;
  renderMode: RenderMode;
  gridVisible: boolean;
  axesVisible: boolean;
  onSelectView: (view: ViewPreset) => void;
  onSelectRenderMode: (mode: RenderMode) => void;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
}

const VIEW_PRESETS: { id: ViewPreset; label: string }[] = [
  { id: 'ISO', label: 'ISO' },
  { id: 'FRONT', label: 'FRONT' },
  { id: 'BACK', label: 'BACK' },
  { id: 'LEFT', label: 'LEFT' },
  { id: 'RIGHT', label: 'RIGHT' },
  { id: 'TOP', label: 'TOP' },
  { id: 'BOTTOM', label: 'BOTTOM' },
];

const RENDER_MODES: { id: RenderMode; label: string }[] = [
  { id: 'SOLID', label: 'SOLID' },
  { id: 'TEXTURE', label: 'TEXTURE' },
  { id: 'VERTEX_COLORS', label: 'VERTEX COLORS' },
  { id: 'WIREFRAME', label: 'WIREFRAME' },
  { id: 'SOLID_WIRE', label: 'SOLID + WIRE' },
];

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  currentView,
  renderMode,
  gridVisible,
  axesVisible,
  onSelectView,
  onSelectRenderMode,
  onToggleGrid,
  onToggleAxes,
}) => {
  return (
    <div className="bottom-toolbar" id="bottom-toolbar">
      {/* SECTION 1: VIEW PRESETS */}
      <div className="toolbar-section">
        <span className="toolbar-label">VIEWS:</span>
        {VIEW_PRESETS.map((vp) => (
          <button
            key={vp.id}
            className={`toolbar-btn ${currentView === vp.id ? 'active' : ''}`}
            onClick={() => onSelectView(vp.id)}
            title={`Switch to ${vp.label} view`}
            id={`btn-view-${vp.id.toLowerCase()}`}
          >
            {vp.label}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* SECTION 2: GRID AND AXES TOGGLES */}
      <div className="toolbar-section">
        <button
          className={`toolbar-btn ${gridVisible ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Toggle Ground Grid (G)"
          id="btn-toggle-grid"
        >
          GRID
        </button>
        <button
          className={`toolbar-btn ${axesVisible ? 'active' : ''}`}
          onClick={onToggleAxes}
          title="Toggle Coordinate Axes (A)"
          id="btn-toggle-axes"
        >
          AXES
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* SECTION 3: RENDERING MODES */}
      <div className="toolbar-section">
        {RENDER_MODES.map((rm) => (
          <button
            key={rm.id}
            className={`toolbar-btn ${renderMode === rm.id ? 'active' : ''}`}
            onClick={() => onSelectRenderMode(rm.id)}
            title={`Switch to ${rm.label} mode`}
            id={`btn-render-${rm.id.toLowerCase()}`}
          >
            {rm.label}
          </button>
        ))}
      </div>
    </div>
  );
};
