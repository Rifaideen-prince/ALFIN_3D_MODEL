# 3D VISION - Professional 3D Model Viewer

**3D VISION** is a high-performance, browser-based 3D CAD and mesh inspection application. It parses and renders actual 3D geometry from **OBJ (.obj)** and **Stereolithography STL (.stl)** files directly in the browser with zero cloud dependencies.

---

## Features

- **Embedded Default Model**: Automatically loads the high-detail `WIND_TURBINE.stl` (~93.2 MB binary STL) model on startup, centering and framing the turbine in attractive isometric view.
- **Real 3D Geometry Rendering**: Powered by Three.js with full WebGL hardware acceleration.
- **File Format Support**:
  - Wavefront OBJ (`.obj`) with companion material support (`.mtl`) and automatic fallback CAD shaders.
  - Stereolithography STL (`.stl`) in both Binary and ASCII encoding with automated vertex normal computation.
- **100% Client-Side Privacy**: Files are read in memory locally inside the browser. No geometry or CAD files are uploaded to any server.
- **Interactive Camera Navigation**:
  - Left Mouse Drag: Orbit around model.
  - Right Mouse Drag: Pan camera in screen space.
  - Mouse Wheel: Smooth zoom.
  - Touchscreen: Multi-touch orbit, pinch zoom, and pan.
  - Preset Orthographic & Perspective viewing angles.
- **Synchronized XYZ Orientation Gizmo**:
  - Interactive top-right coordinate compass.
  - Rotates dynamically in sync with camera pitch, roll, and yaw.
  - Interactive axis markers (+X, -X, +Y, -Y, +Z, -Z) for 1-click CAD view alignment.
- **CAD View Presets**:
  - ISO (Isometric 3D)
  - FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM
  - Smooth camera transition animations.
- **Visual Rendering Modes**:
  - **SOLID**: Realistic engineering surface shading with customizable tint.
  - **TEXTURE**: Full material textures and diffuse maps.
  - **VERTEX COLORS**: Hardware vertex color attributes.
  - **WIREFRAME**: Pure polygonal wireframe inspection.
  - **SOLID + WIRE**: Solid surface overlayed with wireframe contours (with polygon offset preventing z-fighting).
- **Inspection & Diagnostics**:
  - Real-time FPS counter and draw calls.
  - Geometry analysis: Vertex count, face count, triangle count, mesh count, material count.
  - Model dimensions (Width X, Height Y, Depth Z, Volume) with unit selector (Model units, mm, cm, m, inches).
  - 3D Bounding Box visual helper.
  - Surface Normals visual helper.
  - Full WebGL hardware diagnostics.
- **Keyboard Shortcuts**:
  - `Ctrl + O` / `Cmd + O`: Open 3D file picker.
  - `F`: Fit complete model into viewport.
  - `R`: Reset camera to standard isometric orientation.
  - `G`: Toggle ground grid.
  - `A`: Toggle XYZ axes.
  - `W`: Toggle wireframe mode.
  - `1` - `7`: Switch CAD standard views.
  - `Esc`: Close open modal panels.

---

## Getting Started

### Prerequisites

- Node.js (version 18 or newer recommended)
- npm

### Installation

```bash
npm install
```

### Development Server

Start the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### Production Build

Create an optimized production bundle:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## Architecture & Codebase Structure

```
ALFIN_3D_MODEL/
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx               # Top navigation bar, statistics, and tool buttons
│   │   ├── AppInfoModal.tsx            # About & client-side privacy modal
│   │   ├── BottomToolbar.tsx           # Views presets, grid/axes toggles, rendering modes
│   │   ├── CameraControls.tsx          # Floating Zoom In/Out, Fit Model, Reset Camera
│   │   ├── DiagnosticsModal.tsx        # WebGL rendering engine diagnostics
│   │   ├── EmptyState.tsx              # CAD-styled initial upload dropzone & sample loader
│   │   ├── KeyboardShortcutsDialog.tsx # Interactive keyboard shortcuts cheat sheet
│   │   ├── ModelInfoBadge.tsx          # Floating top-left badge with status and tri count
│   │   ├── ModelInfoPanel.tsx          # Geometry dimensions, bounding box & unit selector
│   │   ├── ModelViewer.tsx             # Three.js viewport, lighting, shaders, controls
│   │   ├── OrientationGizmo.tsx        # Synchronized interactive XYZ coordinate gizmo
│   │   ├── SettingsPanel.tsx           # Viewport, camera, lighting, and helper preferences
│   │   ├── ToastNotifications.tsx      # Non-blocking error and status notifications
│   │   └── UploadOverlay.tsx           # Drag and drop active visual indicator
│   ├── styles/
│   │   └── index.css                   # Technical CAD dark-mode theme & tokens
│   ├── types/
│   │   └── viewer.ts                   # TypeScript interfaces and domain types
│   ├── utils/
│   │   ├── cameraPresets.ts            # View vectors, fit calculation & smooth animations
│   │   ├── defaultSamples.ts           # Bundled precision OBJ & STL models for verification
│   │   ├── formatters.ts               # Numeric formatting (compact K/M, dimensions, units)
│   │   ├── modelLoader.ts              # OBJLoader and STLLoader parsing pipeline
│   │   └── modelStatistics.ts          # Hierarchy metrics calculation & GPU memory disposal
│   ├── App.tsx                         # Core application state coordinator
│   └── main.tsx                        # Application mount point
├── index.html                          # HTML5 shell with CAD fonts
├── package.json
├── tsconfig.json
└── vite.config.ts
```
