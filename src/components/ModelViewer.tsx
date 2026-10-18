import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import {
  ViewPreset,
  RenderMode,
  ViewerSettings,
  DiagnosticsInfo,
  ModelStats
} from '../types/viewer';
import {
  calculateFitDistance,
  adjustCameraPlanes,
  getPresetDirection,
  animateCameraTo
} from '../utils/cameraPresets';

export interface ModelViewerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitModel: () => void;
  resetCamera: () => void;
}

interface ModelViewerProps {
  modelGroup: THREE.Group | null;
  modelStats: ModelStats | null;
  materialsMap: Map<string, THREE.Material | THREE.Material[]>;
  settings: ViewerSettings;
  currentView: ViewPreset;
  renderMode: RenderMode;
  onFpsUpdate: (fps: number, drawCalls: number) => void;
  onDiagnosticsUpdate: (diagnostics: DiagnosticsInfo) => void;
  onCameraChange?: (camera: THREE.Camera) => void;
}

export const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(({
  modelGroup,
  modelStats,
  materialsMap,
  settings,
  currentView,
  renderMode,
  onFpsUpdate,
  onDiagnosticsUpdate,
  onCameraChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const persCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const activeCameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Scene Objects
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  
  // Model Visual Helpers
  const bboxHelperRef = useRef<THREE.Box3Helper | null>(null);
  const normalsHelperGroupRef = useRef<THREE.Group | null>(null);
  const wireframeGroupRef = useRef<THREE.Group | null>(null);

  // Animation and FPS tracking
  const reqAnimIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const cancelTransitionRef = useRef<(() => void) | null>(null);

  // Active model bounding sphere radius & center for camera math
  const sceneRadiusRef = useRef<number>(10);
  const sceneCenterRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // -------------------------------------------------------------
  // FIT MODEL IN VIEWPORT FUNCTION
  // -------------------------------------------------------------
  const fitModelToViewport = useCallback(
    (presetDirection?: THREE.Vector3) => {
      const camera = activeCameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls || !modelGroup) return;

      const box = new THREE.Box3().setFromObject(modelGroup);
      if (box.isEmpty()) return;

      const { center, distance, radius } = calculateFitDistance(box, camera as THREE.PerspectiveCamera);
      sceneRadiusRef.current = radius;
      sceneCenterRef.current.copy(center);

      adjustCameraPlanes(camera as THREE.PerspectiveCamera, radius, distance);

      // Determine new camera position
      const dir = presetDirection
        ? presetDirection.clone()
        : camera.position.clone().sub(controls.target).normalize();

      if (dir.lengthSq() < 0.0001) {
        dir.set(1, 0.8, 1).normalize();
      }

      const targetPos = center.clone().add(dir.multiplyScalar(distance));

      if (cancelTransitionRef.current) {
        cancelTransitionRef.current();
      }

      cancelTransitionRef.current = animateCameraTo(camera, controls, targetPos, center, 400);
    },
    [modelGroup]
  );

  // -------------------------------------------------------------
  // IMPERATIVE CAMERA ACTIONS (ZOOM, FIT, RESET)
  // -------------------------------------------------------------
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const controls = controlsRef.current;
      const camera = activeCameraRef.current;
      if (!controls || !camera) return;

      if (camera instanceof THREE.PerspectiveCamera) {
        const offset = camera.position.clone().sub(controls.target);
        if (offset.length() > sceneRadiusRef.current * 0.2) {
          offset.multiplyScalar(0.8);
          camera.position.copy(controls.target).add(offset);
        }
      } else if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = Math.min(camera.zoom * 1.25, 20);
        camera.updateProjectionMatrix();
      }
      controls.update();
    },

    zoomOut: () => {
      const controls = controlsRef.current;
      const camera = activeCameraRef.current;
      if (!controls || !camera) return;

      if (camera instanceof THREE.PerspectiveCamera) {
        const offset = camera.position.clone().sub(controls.target);
        offset.multiplyScalar(1.25);
        camera.position.copy(controls.target).add(offset);
      } else if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = Math.max(camera.zoom * 0.8, 0.1);
        camera.updateProjectionMatrix();
      }
      controls.update();
    },

    fitModel: () => {
      fitModelToViewport();
    },

    resetCamera: () => {
      const isoDir = getPresetDirection('ISO');
      fitModelToViewport(isoDir);
    },
  }), [fitModelToViewport]);

  // -------------------------------------------------------------
  // INITIALIZE SCENE, RENDERER, CAMERAS, AND CONTROLS
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.backgroundColor);
    sceneRef.current = scene;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = settings.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Cameras
    const aspect = width / height;
    const persCamera = new THREE.PerspectiveCamera(settings.fov, aspect, 0.01, 2000);
    persCamera.position.set(25, 20, 25);
    persCameraRef.current = persCamera;

    const orthoFrustum = 30;
    const orthoCamera = new THREE.OrthographicCamera(
      -orthoFrustum * aspect,
      orthoFrustum * aspect,
      orthoFrustum,
      -orthoFrustum,
      0.01,
      2000
    );
    orthoCamera.position.set(25, 20, 25);
    orthoCameraRef.current = orthoCamera;

    const initialCamera = settings.cameraType === 'orthographic' ? orthoCamera : persCamera;
    activeCameraRef.current = initialCamera;

    if (onCameraChange) {
      onCameraChange(initialCamera);
    }

    // 4. Controls
    const controls = new OrbitControls(initialCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = settings.orbitSpeed;
    controls.zoomSpeed = settings.zoomSpeed;
    controls.panSpeed = settings.panSpeed;
    controls.screenSpacePanning = true;
    controlsRef.current = controls;

    // 5. Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x151b24, 0.7 * settings.lightIntensity);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2 * settings.lightIntensity);
    dirLight.position.set(40, 60, 40);
    dirLight.castShadow = settings.shadowsEnabled;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const fillLight = new THREE.DirectionalLight(0x00bfff, 0.4 * settings.lightIntensity);
    fillLight.position.set(-40, 20, -40);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 6. Ground Grid & Axes
    const gridSize = settings.gridSize || 100;
    const grid = new THREE.GridHelper(gridSize, 50, 0x00bfff, 0x1c2b3d);
    grid.position.y = 0;
    grid.visible = settings.gridVisible;
    scene.add(grid);
    gridHelperRef.current = grid;

    const axes = new THREE.AxesHelper(gridSize * 0.4);
    (axes.material as THREE.Material).depthTest = false;
    axes.renderOrder = 1;
    axes.visible = settings.axesVisible;
    scene.add(axes);
    axesHelperRef.current = axes;

    // 7. Ground Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(gridSize * 2, gridSize * 2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    shadowPlane.visible = settings.shadowsEnabled;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    // 8. Normal helper group
    const normalsGroup = new THREE.Group();
    scene.add(normalsGroup);
    normalsHelperGroupRef.current = normalsGroup;

    // 9. Wireframe overlay group
    const wireGroup = new THREE.Group();
    scene.add(wireGroup);
    wireframeGroupRef.current = wireGroup;

    // Get WebGL diagnostic info
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
    const rendererRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // 10. Animation Loop
    const animate = () => {
      reqAnimIdRef.current = requestAnimationFrame(animate);

      controls.update();

      const currentCam = activeCameraRef.current || persCamera;
      renderer.render(scene, currentCam);

      // FPS and diagnostics calculation
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - fpsTimerRef.current;

      if (elapsed >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / elapsed);
        const frameTime = (now - lastTimeRef.current);
        const calls = renderer.info.render.calls;
        const tris = renderer.info.render.triangles;
        const pts = renderer.info.render.points;
        const lines = renderer.info.render.lines;
        const geom = renderer.info.memory.geometries;
        const tex = renderer.info.memory.textures;

        onFpsUpdate(calculatedFps, calls);
        onDiagnosticsUpdate({
          fps: calculatedFps,
          frameTimeMs: frameTime,
          memoryGeometries: geom,
          memoryTextures: tex,
          renderCalls: calls,
          renderTriangles: tris,
          renderPoints: pts,
          renderLines: lines,
          rendererVendor,
          rendererRenderer,
        });

        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }
      lastTimeRef.current = now;
    };

    reqAnimIdRef.current = requestAnimationFrame(animate);

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          const newAspect = newW / newH;
          persCamera.aspect = newAspect;
          persCamera.updateProjectionMatrix();

          const curOrtho = orthoCamera;
          const halfH = (curOrtho.top - curOrtho.bottom) / 2;
          curOrtho.left = -halfH * newAspect;
          curOrtho.right = halfH * newAspect;
          curOrtho.updateProjectionMatrix();

          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (reqAnimIdRef.current) cancelAnimationFrame(reqAnimIdRef.current);
      if (cancelTransitionRef.current) cancelTransitionRef.current();

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // -------------------------------------------------------------
  // UPDATE CAMERA PROJECTION TYPE (PERSPECTIVE / ORTHOGRAPHIC)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!persCameraRef.current || !orthoCameraRef.current || !controlsRef.current) return;

    const newCam =
      settings.cameraType === 'orthographic' ? orthoCameraRef.current : persCameraRef.current;
    
    // Synchronize position & target
    if (activeCameraRef.current && activeCameraRef.current !== newCam) {
      newCam.position.copy(activeCameraRef.current.position);
      newCam.quaternion.copy(activeCameraRef.current.quaternion);
    }

    activeCameraRef.current = newCam;
    controlsRef.current.object = newCam;
    controlsRef.current.update();

    if (onCameraChange) {
      onCameraChange(newCam);
    }
  }, [settings.cameraType, onCameraChange]);

  // -------------------------------------------------------------
  // UPDATE SETTINGS (BACKGROUND, LIGHTS, GRID, AXES, SHADOWS, FOV)
  // -------------------------------------------------------------
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(settings.backgroundColor);
    }

    if (persCameraRef.current) {
      persCameraRef.current.fov = settings.fov;
      persCameraRef.current.updateProjectionMatrix();
    }

    if (controlsRef.current) {
      controlsRef.current.rotateSpeed = settings.orbitSpeed;
      controlsRef.current.zoomSpeed = settings.zoomSpeed;
      controlsRef.current.panSpeed = settings.panSpeed;
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = 0.7 * settings.lightIntensity;
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = 1.2 * settings.lightIntensity;
      dirLightRef.current.castShadow = settings.shadowsEnabled;
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.4 * settings.lightIntensity;
    }

    if (rendererRef.current) {
      rendererRef.current.shadowMap.enabled = settings.shadowsEnabled;
    }

    if (gridHelperRef.current) {
      gridHelperRef.current.visible = settings.gridVisible;
    }

    if (axesHelperRef.current) {
      axesHelperRef.current.visible = settings.axesVisible;
    }

    if (shadowPlaneRef.current) {
      shadowPlaneRef.current.visible = settings.shadowsEnabled;
    }

    if (bboxHelperRef.current) {
      bboxHelperRef.current.visible = settings.showBoundingBox;
    }

    if (normalsHelperGroupRef.current) {
      normalsHelperGroupRef.current.visible = settings.showNormals;
    }
  }, [settings]);

  // -------------------------------------------------------------
  // ATTACH / DETACH LOADED MODEL GROUP
  // -------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing bounding box and normal helpers
    if (bboxHelperRef.current) {
      scene.remove(bboxHelperRef.current);
      bboxHelperRef.current = null;
    }

    if (normalsHelperGroupRef.current) {
      while (normalsHelperGroupRef.current.children.length > 0) {
        const child = normalsHelperGroupRef.current.children[0];
        normalsHelperGroupRef.current.remove(child);
      }
    }

    if (!modelGroup) {
      // Reposition grid and shadow to origin
      if (gridHelperRef.current) gridHelperRef.current.position.y = 0;
      if (shadowPlaneRef.current) shadowPlaneRef.current.position.y = -0.01;
      return;
    }

    // Add model to scene
    scene.add(modelGroup);

    // Compute bounding box
    modelGroup.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(modelGroup);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const radius = Math.max(box.getBoundingSphere(new THREE.Sphere()).radius, 1);
    sceneRadiusRef.current = radius;
    sceneCenterRef.current.copy(center);

    // Scale ground grid and axes to encompass model dimensions
    const dynamicGridScale = Math.max(radius * 2.5 / (settings.gridSize || 100), 1);
    const groundY = box.min.y;

    if (gridHelperRef.current) {
      gridHelperRef.current.scale.set(dynamicGridScale, 1, dynamicGridScale);
      gridHelperRef.current.position.y = groundY;
    }
    if (axesHelperRef.current) {
      axesHelperRef.current.scale.set(dynamicGridScale, dynamicGridScale, dynamicGridScale);
      axesHelperRef.current.position.set(0, groundY, 0);
    }
    if (shadowPlaneRef.current) {
      shadowPlaneRef.current.scale.set(dynamicGridScale, dynamicGridScale, 1);
      shadowPlaneRef.current.position.y = groundY - 0.02 * dynamicGridScale;
    }

    // Adapt directional light distance and shadow frustum to model scale
    if (dirLightRef.current) {
      dirLightRef.current.position.set(radius * 1.5, radius * 2.5, radius * 1.5);
      dirLightRef.current.shadow.camera.near = 0.5;
      dirLightRef.current.shadow.camera.far = radius * 8;
      const d = radius * 2;
      dirLightRef.current.shadow.camera.left = -d;
      dirLightRef.current.shadow.camera.right = d;
      dirLightRef.current.shadow.camera.top = d;
      dirLightRef.current.shadow.camera.bottom = -d;
      dirLightRef.current.shadow.camera.updateProjectionMatrix();
    }
    if (fillLightRef.current) {
      fillLightRef.current.position.set(-radius * 1.5, radius, -radius * 1.5);
    }

    // Add Bounding Box Helper
    const bboxHelper = new THREE.Box3Helper(box, new THREE.Color(0x00bfff));
    bboxHelper.visible = settings.showBoundingBox;
    scene.add(bboxHelper);
    bboxHelperRef.current = bboxHelper;

    // Create Normals Helpers
    if (normalsHelperGroupRef.current) {
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          try {
            const normalHelper = new VertexNormalsHelper(
              child,
              radius * 0.05,
              0x00e58b
            );
            normalsHelperGroupRef.current?.add(normalHelper);
          } catch (e) {
            console.warn('Normals helper creation skipped for mesh:', e);
          }
        }
      });
      normalsHelperGroupRef.current.visible = settings.showNormals;
    }

    // Auto-fit camera to model in isometric view on load
    const isoDir = getPresetDirection('ISO');
    fitModelToViewport(isoDir);

    return () => {
      scene.remove(modelGroup);
    };
  }, [modelGroup, fitModelToViewport]);

  // -------------------------------------------------------------
  // HANDLE RENDERING MODES (SOLID, TEXTURE, VERTEX COLORS, WIREFRAME, SOLID+WIRE)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!modelGroup) return;

    // Clear any previous wireframe overlay meshes
    if (wireframeGroupRef.current) {
      while (wireframeGroupRef.current.children.length > 0) {
        const obj = wireframeGroupRef.current.children[0];
        wireframeGroupRef.current.remove(obj);
      }
    }

    modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const originalMat = materialsMap.get(child.uuid);

        switch (renderMode) {
          case 'SOLID': {
            child.visible = true;
            child.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(settings.modelColor),
              roughness: 0.35,
              metalness: 0.25,
              side: THREE.DoubleSide,
            });
            break;
          }

          case 'TEXTURE': {
            child.visible = true;
            // Restore original materials
            if (originalMat) {
              child.material = originalMat;
            } else {
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(settings.modelColor),
                roughness: 0.35,
                metalness: 0.25,
                side: THREE.DoubleSide,
              });
            }
            break;
          }

          case 'VERTEX_COLORS': {
            child.visible = true;
            const hasColors = child.geometry && child.geometry.getAttribute('color');
            child.material = new THREE.MeshStandardMaterial({
              vertexColors: !!hasColors,
              color: hasColors ? 0xffffff : new THREE.Color(settings.modelColor),
              roughness: 0.4,
              metalness: 0.2,
              side: THREE.DoubleSide,
            });
            break;
          }

          case 'WIREFRAME': {
            child.visible = true;
            child.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(settings.wireframeColor),
              wireframe: true,
              side: THREE.DoubleSide,
            });
            break;
          }

          case 'SOLID_WIRE': {
            // Render solid mesh with polygon offset to avoid z-fighting
            child.visible = true;
            const solidMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(settings.modelColor),
              roughness: 0.35,
              metalness: 0.25,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1,
              side: THREE.DoubleSide,
            });
            child.material = solidMat;

            // Add wireframe overlay
            const wireGeo = new THREE.WireframeGeometry(child.geometry);
            const wireLine = new THREE.LineSegments(
              wireGeo,
              new THREE.LineBasicMaterial({
                color: new THREE.Color(settings.wireframeColor),
                transparent: true,
                opacity: 0.75,
              })
            );
            wireLine.matrix.copy(child.matrixWorld);
            wireLine.matrixAutoUpdate = false;
            wireframeGroupRef.current?.add(wireLine);
            break;
          }
        }
      }
    });
  }, [renderMode, modelGroup, materialsMap, settings.modelColor, settings.wireframeColor]);

  // -------------------------------------------------------------
  // HANDLE VIEW PRESET SELECTION (ISO, FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!modelGroup) return;
    const dir = getPresetDirection(currentView);
    fitModelToViewport(dir);
  }, [currentView]);

  return (
    <div
      ref={containerRef}
      className="three-canvas-container"
      id="viewport-canvas-container"
    />
  );
});
