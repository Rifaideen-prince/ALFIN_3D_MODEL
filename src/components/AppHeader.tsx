import React from 'react';
import {
  Box,
  FolderOpen,
  Info,
  Settings,
  Activity,
  Keyboard,
  HelpCircle,
  Maximize,
  Minimize
} from 'lucide-react';
import { ModelStats } from '../types/viewer';
import { formatCompactNumber, formatExactNumber, truncateFilename } from '../utils/formatters';

interface AppHeaderProps {
  modelStats: ModelStats | null;
  fps: number;
  drawCalls: number;
  isFullscreen: boolean;
  activeDrawer: 'info' | 'settings' | null;
  onOpenModelClick: () => void;
  onToggleDrawer: (drawer: 'info' | 'settings') => void;
  onOpenDiagnostics: () => void;
  onOpenShortcuts: () => void;
  onOpenAppInfo: () => void;
  onToggleFullscreen: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  modelStats,
  fps,
  drawCalls,
  isFullscreen,
  activeDrawer,
  onOpenModelClick,
  onToggleDrawer,
  onOpenDiagnostics,
  onOpenShortcuts,
  onOpenAppInfo,
  onToggleFullscreen,
}) => {
  const getFpsClass = (val: number) => {
    if (val >= 50) return 'fps-good';
    if (val >= 30) return 'fps-warn';
    return 'fps-low';
  };

  return (
    <header className="top-nav-bar">
      {/* Left Brand & Current Model */}
      <div className="nav-left">
        <div className="app-brand" title="3D VISION - 3D CAD & Mesh Inspector">
          <Box className="brand-logo-icon" />
          <span className="brand-title">
            3D VISION
            <span className="brand-badge">PRO</span>
          </span>
        </div>

        <div className="model-header-badge" title={modelStats ? modelStats.filename : 'No model loaded'}>
          <span className="model-header-label">MODEL:</span>
          {modelStats ? (
            <span className="model-header-name">
              {truncateFilename(modelStats.filename, 22)}
            </span>
          ) : (
            <span className="model-header-name no-model">No model loaded</span>
          )}
        </div>
      </div>

      {/* Nav Center: Technical Statistics */}
      <div className="nav-stats-group">
        <div className="stat-item" title="Rendering Frames Per Second">
          <span className="stat-label">FPS:</span>
          <span className={`stat-value ${getFpsClass(fps)}`}>{fps || 60}</span>
        </div>

        <div className="stat-item" title={modelStats ? `Total vertices: ${formatExactNumber(modelStats.verticesCount)}` : 'Vertices count'}>
          <span className="stat-label">VERTICES:</span>
          <span className="stat-value">
            {modelStats ? formatCompactNumber(modelStats.verticesCount) : '—'}
          </span>
        </div>

        <div className="stat-item" title={modelStats ? `Total faces: ${formatExactNumber(modelStats.facesCount)}` : 'Faces count'}>
          <span className="stat-label">FACES:</span>
          <span className="stat-value">
            {modelStats ? formatCompactNumber(modelStats.facesCount) : '—'}
          </span>
        </div>

        <div className="stat-item" title={modelStats ? `Total triangles: ${formatExactNumber(modelStats.trianglesCount)}` : 'Triangles count'}>
          <span className="stat-label">TRIANGLES:</span>
          <span className="stat-value">
            {modelStats ? formatCompactNumber(modelStats.trianglesCount) : '—'}
          </span>
        </div>

        <div className="stat-item" title="Actual GPU Draw Calls">
          <span className="stat-label">DRAW CALLS:</span>
          <span className="stat-value">
            {modelStats ? (drawCalls > 0 ? drawCalls : modelStats.meshesCount || 1) : '—'}
          </span>
        </div>
      </div>

      {/* Nav Right Actions */}
      <div className="nav-right">
        <button
          className="btn-upload-primary"
          onClick={onOpenModelClick}
          id="btn-open-model"
          title="Open OBJ or STL model file (Ctrl+O)"
        >
          <FolderOpen size={16} />
          <span>OPEN 3D MODEL</span>
        </button>

        <button
          className={`nav-icon-btn ${activeDrawer === 'info' ? 'active' : ''}`}
          onClick={() => onToggleDrawer('info')}
          title="Model Geometry & Dimensions Info"
          id="btn-model-info"
          aria-label="Model Information"
        >
          <Info size={18} />
        </button>

        <button
          className={`nav-icon-btn ${activeDrawer === 'settings' ? 'active' : ''}`}
          onClick={() => onToggleDrawer('settings')}
          title="Viewport & Shading Settings"
          id="btn-settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        <button
          className="nav-icon-btn"
          onClick={onOpenDiagnostics}
          title="Performance Diagnostics"
          id="btn-diagnostics"
          aria-label="Diagnostics"
        >
          <Activity size={18} />
        </button>

        <button
          className="nav-icon-btn"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          id="btn-shortcuts"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard size={18} />
        </button>

        <button
          className="nav-icon-btn"
          onClick={onOpenAppInfo}
          title="About 3D VISION"
          id="btn-about"
          aria-label="About"
        >
          <HelpCircle size={18} />
        </button>

        <button
          className="nav-icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          id="btn-fullscreen"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </header>
  );
};
