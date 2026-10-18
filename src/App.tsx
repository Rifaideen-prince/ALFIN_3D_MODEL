import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  ViewPreset,
  RenderMode,
  ViewerSettings,
  DiagnosticsInfo,
  ModelStats,
  ToastNotification,
  UnitType
} from './types/viewer';
import { AppHeader } from './components/AppHeader';
import { ModelInfoBadge } from './components/ModelInfoBadge';
import { OrientationGizmo } from './components/OrientationGizmo';
import { BottomToolbar } from './components/BottomToolbar';
import { CameraControls } from './components/CameraControls';
import { EmptyState } from './components/EmptyState';
import { UploadOverlay } from './components/UploadOverlay';
import { ModelInfoPanel } from './components/ModelInfoPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { AppInfoModal } from './components/AppInfoModal';
import { ToastNotifications } from './components/ToastNotifications';
import { ModelViewer, ModelViewerHandle } from './components/ModelViewer';
import { loadModelFile, loadObjFromString, loadStlFromBuffer, loadStlFromUrl } from './utils/modelLoader';
import { calculateModelStats, disposeHierarchy } from './utils/modelStatistics';
import { generateSampleObj, generateSampleStl } from './utils/defaultSamples';

const DEFAULT_SETTINGS: ViewerSettings = {
  cameraType: 'perspective',
  fov: 45,
  orbitSpeed: 1.0,
  zoomSpeed: 1.0,
  panSpeed: 1.0,
  backgroundColor: '#050608',
  modelColor: '#9BA6B2',
  gridVisible: true,
  gridSize: 100,
  axesVisible: true,
  lightIntensity: 1.0,
  shadowsEnabled: true,
  showBoundingBox: false,
  showNormals: false,
  wireframeColor: '#00BFFF',
  displayFps: true,
  unit: 'unit',
};

const SETTINGS_STORAGE_KEY = '3D_VISION_SETTINGS_V1';

export const App: React.FC = () => {
  // Viewer state
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [materialsMap, setMaterialsMap] = useState<Map<string, THREE.Material | THREE.Material[]>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('LOADING WIND_TURBINE.STL...');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // View & Render settings
  const [currentView, setCurrentView] = useState<ViewPreset>('ISO');
  const [renderMode, setRenderMode] = useState<RenderMode>('SOLID');

  // Stats & Performance
  const [fps, setFps] = useState<number>(60);
  const [drawCalls, setDrawCalls] = useState<number>(0);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsInfo>({
    fps: 60,
    frameTimeMs: 16.6,
    memoryGeometries: 0,
    memoryTextures: 0,
    renderCalls: 0,
    renderTriangles: 0,
    renderPoints: 0,
    renderLines: 0,
  });

  // Settings state (hydrated from localStorage)
  const [settings, setSettings] = useState<ViewerSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not load saved settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Active camera for Gizmo sync
  const [activeCamera, setActiveCamera] = useState<THREE.Camera | null>(null);

  // Modals & Drawers state
  const [activeDrawer, setActiveDrawer] = useState<'info' | 'settings' | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<ModelViewerHandle>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);

  // Keep currentModelGroupRef updated for memory disposal
  useEffect(() => {
    currentModelGroupRef.current = modelGroup;
  }, [modelGroup]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }, [settings]);

  // Toast notification helper
  const addToast = useCallback((type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { id, type, title, message, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5s (or 8s for errors)
    const timeout = type === 'error' ? 8000 : 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // MODEL LOADING PIPELINE WITH RESOURCE DISPOSAL
  // -------------------------------------------------------------
  const processAndSetModel = (
    newGroup: THREE.Group,
    newMats: Map<string, THREE.Material | THREE.Material[]>,
    filename: string,
    fileSize: number,
    loadDuration: number
  ) => {
    // Dispose previous model resources to prevent GPU memory leak
    if (currentModelGroupRef.current) {
      disposeHierarchy(currentModelGroupRef.current);
    }

    // Center model at origin
    newGroup.position.set(0, 0, 0);
    newGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(newGroup);
    const center = new THREE.Vector3();
    box.getCenter(center);
    newGroup.position.sub(center);
    newGroup.updateMatrixWorld(true);

    // Compute geometry statistics
    const stats = calculateModelStats(newGroup, filename, fileSize, loadDuration);

    setModelGroup(newGroup);
    setMaterialsMap(newMats);
    setModelStats(stats);
    setCurrentView('ISO');

    addToast(
      'success',
      'Model Loaded Successfully',
      `${filename} (${stats.trianglesCount.toLocaleString()} triangles, ${stats.meshesCount} mesh${stats.meshesCount > 1 ? 'es' : ''})`
    );
  };

  // -------------------------------------------------------------
  // AUTOMATICALLY LOAD DEFAULT WIND TURBINE MODEL ON STARTUP
  // -------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    const loadDefaultWindTurbine = async () => {
      setIsLoading(true);
      setLoadingMessage('LOADING WIND_TURBINE.STL...');
      const startTime = performance.now();

      try {
        const { result, size } = await loadStlFromUrl('/models/WIND_TURBINE.stl', 'WIND_TURBINE.stl');
        if (isCancelled) return;
        const duration = performance.now() - startTime;
        processAndSetModel(result.root, result.materialsMap, 'WIND_TURBINE.stl', size, duration);
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Failed to load WIND_TURBINE.stl:', err);
        addToast('error', 'Failed to load WIND_TURBINE.stl', msg);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDefaultWindTurbine();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Find primary 3D model file (.obj or .stl)
    const mainFile = files.find((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext === 'obj' || ext === 'stl';
    });

    if (!mainFile) {
      addToast(
        'error',
        'Unsupported File Format',
        'Please select a valid 3D file with .OBJ or .STL extension.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage(`PARSING ${mainFile.name.toUpperCase()}...`);
    const startTime = performance.now();

    try {
      const result = await loadModelFile(mainFile, files);
      const duration = performance.now() - startTime;
      processAndSetModel(result.root, result.materialsMap, mainFile.name, mainFile.size, duration);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Error loading model:', err);
      addToast('error', 'Model Import Failed', msg);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // -------------------------------------------------------------
  // SAMPLE MODEL LOADERS
  // -------------------------------------------------------------
  const loadSampleBracketObj = () => {
    setIsLoading(true);
    setLoadingMessage('PARSING SAMPLE BRACKET.OBJ...');
    const startTime = performance.now();
    try {
      const objText = generateSampleObj();
      const result = loadObjFromString(objText, 'Mechanical_Bracket.obj');
      const duration = performance.now() - startTime;
      processAndSetModel(result.root, result.materialsMap, 'Mechanical_Bracket.obj', objText.length, duration);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', 'Failed loading sample model', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleCubeStl = () => {
    setIsLoading(true);
    setLoadingMessage('PARSING SAMPLE CUBE.STL...');
    const startTime = performance.now();
    try {
      const stlText = generateSampleStl();
      const encoder = new TextEncoder();
      const buffer = encoder.encode(stlText).buffer;
      const result = loadStlFromBuffer(buffer, 'Calibration_Cube.stl');
      const duration = performance.now() - startTime;
      processAndSetModel(result.root, result.materialsMap, 'Calibration_Cube.stl', buffer.byteLength, duration);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', 'Failed loading sample model', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // DRAG AND DROP HANDLERS
  // -------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only toggle if leaving the window/wrapper
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  // -------------------------------------------------------------
  // KEYBOARD SHORTCUTS LISTENER
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside an input or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        return;
      }

      // Ctrl+O or Cmd+O: Open file picker
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }

      // Escape: Close active drawer or modal
      if (e.key === 'Escape') {
        if (activeDrawer) setActiveDrawer(null);
        if (isDiagnosticsOpen) setIsDiagnosticsOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isAppInfoOpen) setIsAppInfoOpen(false);
        return;
      }

      // F: Fit model
      if (e.key.toLowerCase() === 'f') {
        viewerRef.current?.fitModel();
        return;
      }

      // R: Reset camera
      if (e.key.toLowerCase() === 'r') {
        viewerRef.current?.resetCamera();
        setCurrentView('ISO');
        return;
      }

      // G: Toggle ground grid
      if (e.key.toLowerCase() === 'g') {
        setSettings((prev) => ({ ...prev, gridVisible: !prev.gridVisible }));
        return;
      }

      // A: Toggle XYZ axes
      if (e.key.toLowerCase() === 'a') {
        setSettings((prev) => ({ ...prev, axesVisible: !prev.axesVisible }));
        return;
      }

      // W: Toggle wireframe
      if (e.key.toLowerCase() === 'w') {
        setRenderMode((prev) => (prev === 'WIREFRAME' ? 'SOLID' : 'WIREFRAME'));
        return;
      }

      // 1-7: Standard View presets
      switch (e.key) {
        case '1': setCurrentView('ISO'); break;
        case '2': setCurrentView('FRONT'); break;
        case '3': setCurrentView('BACK'); break;
        case '4': setCurrentView('LEFT'); break;
        case '5': setCurrentView('RIGHT'); break;
        case '6': setCurrentView('TOP'); break;
        case '7': setCurrentView('BOTTOM'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDrawer, isDiagnosticsOpen, isShortcutsOpen, isAppInfoOpen]);

  // -------------------------------------------------------------
  // FULLSCREEN TOGGLE
  // -------------------------------------------------------------
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".obj,.stl,.mtl"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files);
        }}
      />

      {/* Top Navigation Bar */}
      <AppHeader
        modelStats={modelStats}
        fps={fps}
        drawCalls={drawCalls}
        isFullscreen={isFullscreen}
        activeDrawer={activeDrawer}
        onOpenModelClick={() => fileInputRef.current?.click()}
        onToggleDrawer={(drawer) =>
          setActiveDrawer((prev) => (prev === drawer ? null : drawer))
        }
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAppInfo={() => setIsAppInfoOpen(true)}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Viewport Container */}
      <main className="viewport-wrapper">
        {/* Three.js Model Viewport */}
        <ModelViewer
          ref={viewerRef}
          modelGroup={modelGroup}
          modelStats={modelStats}
          materialsMap={materialsMap}
          settings={settings}
          currentView={currentView}
          renderMode={renderMode}
          onFpsUpdate={(newFps, newDrawCalls) => {
            setFps(newFps);
            setDrawCalls(newDrawCalls);
          }}
          onDiagnosticsUpdate={setDiagnostics}
          onCameraChange={setActiveCamera}
        />

        {/* Floating Model Info Badge (Top-Left) */}
        <ModelInfoBadge
          stats={modelStats}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
        />

        {/* Synchronized XYZ Orientation Gizmo (Top-Right) */}
        <OrientationGizmo
          camera={activeCamera}
          onSelectView={(view) => setCurrentView(view)}
        />

        {/* Floating Camera Control Tools (Bottom-Right) */}
        <CameraControls
          onZoomIn={() => viewerRef.current?.zoomIn()}
          onZoomOut={() => viewerRef.current?.zoomOut()}
          onFitModel={() => viewerRef.current?.fitModel()}
          onResetCamera={() => {
            viewerRef.current?.resetCamera();
            setCurrentView('ISO');
          }}
        />

        {/* Bottom Toolbar (Bottom-Left) */}
        <BottomToolbar
          currentView={currentView}
          renderMode={renderMode}
          gridVisible={settings.gridVisible}
          axesVisible={settings.axesVisible}
          onSelectView={(view) => setCurrentView(view)}
          onSelectRenderMode={(mode) => setRenderMode(mode)}
          onToggleGrid={() =>
            setSettings((prev) => ({ ...prev, gridVisible: !prev.gridVisible }))
          }
          onToggleAxes={() =>
            setSettings((prev) => ({ ...prev, axesVisible: !prev.axesVisible }))
          }
        />

        {/* Empty State Overlay when no model is active */}
        {!modelGroup && !isLoading && (
          <EmptyState
            onOpenModelClick={() => fileInputRef.current?.click()}
            onLoadSampleObj={loadSampleBracketObj}
            onLoadSampleStl={loadSampleCubeStl}
          />
        )}

        {/* Loading Indicator Overlay */}
        {isLoading && (
          <div className="loading-overlay" id="loading-overlay">
            <div className="loading-spinner" />
            <div className="loading-label">{loadingMessage}</div>
          </div>
        )}

        {/* Drag and Drop Active Overlay */}
        <UploadOverlay isDragging={isDragging} />
      </main>

      {/* Model Geometry & Dimensions Side Panel */}
      {activeDrawer === 'info' && (
        <ModelInfoPanel
          stats={modelStats}
          unit={settings.unit}
          showBoundingBox={settings.showBoundingBox}
          onClose={() => setActiveDrawer(null)}
          onUnitChange={(unit: UnitType) => setSettings((prev) => ({ ...prev, unit }))}
          onToggleBoundingBox={() =>
            setSettings((prev) => ({ ...prev, showBoundingBox: !prev.showBoundingBox }))
          }
        />
      )}

      {/* Viewer Settings Side Panel */}
      {activeDrawer === 'settings' && (
        <SettingsPanel
          settings={settings}
          onUpdateSettings={(newSettings) =>
            setSettings((prev) => ({ ...prev, ...newSettings }))
          }
          onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
          onClose={() => setActiveDrawer(null)}
        />
      )}

      {/* Performance Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        diagnostics={diagnostics}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* About Application Modal */}
      <AppInfoModal
        isOpen={isAppInfoOpen}
        onClose={() => setIsAppInfoOpen(false)}
      />

      {/* Toast Error and Status Notifications */}
      <ToastNotifications toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
