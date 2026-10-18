import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ViewPreset } from '../types/viewer';

export interface CameraTransitionState {
  isTransitioning: boolean;
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startLookAt: THREE.Vector3;
  targetLookAt: THREE.Vector3;
  onComplete?: () => void;
}

/**
 * Calculates optimal distance to frame a box or sphere completely within camera FOV
 */
export function calculateFitDistance(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  margin: number = 1.3
): { center: THREE.Vector3; distance: number; radius: number } {
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  const radius = Math.max(sphere.radius, 0.1);

  let distance = radius * 2.5;

  if (camera instanceof THREE.PerspectiveCamera) {
    const fov = (camera.fov * Math.PI) / 180;
    const aspect = camera.aspect || 1;
    
    // Fit both height and width
    const vDistance = radius / Math.sin(fov / 2);
    const hFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const hDistance = radius / Math.sin(hFov / 2);
    
    distance = Math.max(vDistance, hDistance) * margin;
  } else if (camera instanceof THREE.OrthographicCamera) {
    distance = radius * 3;
    const halfSize = (radius * margin);
    const aspect = (camera.right - camera.left) / (camera.top - camera.bottom) || 1;
    if (aspect >= 1) {
      camera.left = -halfSize * aspect;
      camera.right = halfSize * aspect;
      camera.top = halfSize;
      camera.bottom = -halfSize;
    } else {
      camera.left = -halfSize;
      camera.right = halfSize;
      camera.top = halfSize / aspect;
      camera.bottom = -halfSize / aspect;
    }
    camera.updateProjectionMatrix();
  }

  return { center, distance, radius };
}

/**
 * Adjusts camera near/far clipping planes based on scene radius and distance
 */
export function adjustCameraPlanes(
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  radius: number,
  distance: number
) {
  const safeRadius = Math.max(radius, 0.1);
  camera.near = Math.max(0.01, Math.min(safeRadius * 0.01, distance * 0.01));
  camera.far = Math.max(5000, distance * 25);
  camera.updateProjectionMatrix();
}

/**
 * Gets unit direction vector for standard presets
 * Y-up convention:
 * FRONT: looking from +Z towards center
 * BACK: looking from -Z towards center
 * LEFT: looking from -X towards center
 * RIGHT: looking from +X towards center
 * TOP: looking from +Y towards center
 * BOTTOM: looking from -Y towards center
 * ISO: isometric looking from (+X, +Y, +Z)
 */
export function getPresetDirection(preset: ViewPreset): THREE.Vector3 {
  switch (preset) {
    case 'ISO':
      return new THREE.Vector3(1, 0.8, 1).normalize();
    case 'FRONT':
      return new THREE.Vector3(0, 0, 1);
    case 'BACK':
      return new THREE.Vector3(0, 0, -1);
    case 'LEFT':
      return new THREE.Vector3(-1, 0, 0);
    case 'RIGHT':
      return new THREE.Vector3(1, 0, 0);
    case 'TOP':
      return new THREE.Vector3(0, 1, 0.0001).normalize();
    case 'BOTTOM':
      return new THREE.Vector3(0, -1, 0.0001).normalize();
  }
}

/**
 * Smooth transition to target position and lookAt
 */
export function animateCameraTo(
  camera: THREE.Camera,
  controls: OrbitControls,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  durationMs: number = 350,
  onComplete?: () => void
): () => void {
  const startPos = camera.position.clone();
  const startLookAt = controls.target.clone();
  const startTime = performance.now();
  let cancelled = false;

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const step = (now: number) => {
    if (cancelled) return;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const ease = easeInOutCubic(progress);

    camera.position.lerpVectors(startPos, targetPosition, ease);
    controls.target.lerpVectors(startLookAt, targetLookAt, ease);
    controls.update();

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      camera.position.copy(targetPosition);
      controls.target.copy(targetLookAt);
      controls.update();
      if (onComplete) onComplete();
    }
  };

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
  };
}
