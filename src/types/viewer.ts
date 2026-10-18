export type ViewPreset = 'ISO' | 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';

export type RenderMode = 'SOLID' | 'TEXTURE' | 'VERTEX_COLORS' | 'WIREFRAME' | 'SOLID_WIRE';

export type UnitType = 'unit' | 'mm' | 'cm' | 'm' | 'in';

export type CameraType = 'perspective' | 'orthographic';

export interface BoundingBoxInfo {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
  center: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
}

export interface ModelStats {
  filename: string;
  fileExtension: string;
  fileSize: number;
  verticesCount: number;
  facesCount: number;
  trianglesCount: number;
  meshesCount: number;
  objectsCount: number;
  materialsCount: number;
  drawCalls: number;
  boundingBox: BoundingBoxInfo;
  hasNormals: boolean;
  hasColors: boolean;
  hasTextures: boolean;
  loadTimeMs: number;
}

export interface ViewerSettings {
  cameraType: CameraType;
  fov: number;
  orbitSpeed: number;
  zoomSpeed: number;
  panSpeed: number;
  backgroundColor: string;
  modelColor: string;
  gridVisible: boolean;
  gridSize: number;
  axesVisible: boolean;
  lightIntensity: number;
  shadowsEnabled: boolean;
  showBoundingBox: boolean;
  showNormals: boolean;
  wireframeColor: string;
  displayFps: boolean;
  unit: UnitType;
}

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

export interface DiagnosticsInfo {
  fps: number;
  frameTimeMs: number;
  memoryGeometries: number;
  memoryTextures: number;
  renderCalls: number;
  renderTriangles: number;
  renderPoints: number;
  renderLines: number;
  rendererVendor?: string;
  rendererRenderer?: string;
}
