import React from 'react';
import { X, Sliders, Eye, Sun, Video } from 'lucide-react';
import { ViewerSettings, CameraType } from '../types/viewer';

interface SettingsPanelProps {
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  onResetSettings: () => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onClose,
}) => {
  return (
    <aside className="side-drawer" id="settings-drawer">
      <div className="drawer-header">
        <div className="drawer-title">
          <Sliders size={16} color="#00BFFF" />
          <span>Viewer Settings</span>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-body">
        {/* CAMERA SETTINGS */}
        <div className="drawer-section">
          <div className="drawer-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Video size={13} /> Camera Settings
            </span>
          </div>

          <div className="form-group">
            <span className="form-label">Projection Mode</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`toolbar-btn ${settings.cameraType === 'perspective' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => onUpdateSettings({ cameraType: 'perspective' })}
              >
                Perspective
              </button>
              <button
                className={`toolbar-btn ${settings.cameraType === 'orthographic' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => onUpdateSettings({ cameraType: 'orthographic' })}
              >
                Orthographic
              </button>
            </div>
          </div>

          {settings.cameraType === 'perspective' && (
            <div className="form-group">
              <div className="form-label">
                <span>Field of View (FOV)</span>
                <span style={{ color: '#00BFFF', fontFamily: 'JetBrains Mono' }}>{settings.fov}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={settings.fov}
                onChange={(e) => onUpdateSettings({ fov: Number(e.target.value) })}
              />
            </div>
          )}

          <div className="form-group">
            <div className="form-label">
              <span>Orbit Speed</span>
              <span style={{ color: '#00BFFF', fontFamily: 'JetBrains Mono' }}>{settings.orbitSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={settings.orbitSpeed}
              onChange={(e) => onUpdateSettings({ orbitSpeed: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Zoom Speed</span>
              <span style={{ color: '#00BFFF', fontFamily: 'JetBrains Mono' }}>{settings.zoomSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={settings.zoomSpeed}
              onChange={(e) => onUpdateSettings({ zoomSpeed: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* LIGHTING & SHADING */}
        <div className="drawer-section">
          <div className="drawer-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sun size={13} /> Lighting & Color
            </span>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Lighting Intensity</span>
              <span style={{ color: '#00BFFF', fontFamily: 'JetBrains Mono' }}>{settings.lightIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={settings.lightIntensity}
              onChange={(e) => onUpdateSettings({ lightIntensity: Number(e.target.value) })}
            />
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Soft Shadows</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.shadowsEnabled}
                onChange={(e) => onUpdateSettings({ shadowsEnabled: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Default Model Tint</span>
            <input
              type="color"
              value={settings.modelColor}
              onChange={(e) => onUpdateSettings({ modelColor: e.target.value })}
            />
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Viewport Background</span>
            <input
              type="color"
              value={settings.backgroundColor}
              onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
            />
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Wireframe Color</span>
            <input
              type="color"
              value={settings.wireframeColor}
              onChange={(e) => onUpdateSettings({ wireframeColor: e.target.value })}
            />
          </div>
        </div>

        {/* OVERLAYS & HELPERS */}
        <div className="drawer-section">
          <div className="drawer-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={13} /> Helpers & Overlays
            </span>
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Ground Grid</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.gridVisible}
                onChange={(e) => onUpdateSettings({ gridVisible: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Coordinate Axes</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.axesVisible}
                onChange={(e) => onUpdateSettings({ axesVisible: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>3D Bounding Box</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showBoundingBox}
                onChange={(e) => onUpdateSettings({ showBoundingBox: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-control-row">
            <span className="form-label" style={{ margin: 0 }}>Surface Normals</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showNormals}
                onChange={(e) => onUpdateSettings({ showNormals: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <button
          className="toolbar-btn"
          style={{ width: '100%', marginTop: 8, padding: '8px' }}
          onClick={onResetSettings}
        >
          Reset All Settings to Default
        </button>
      </div>
    </aside>
  );
};
