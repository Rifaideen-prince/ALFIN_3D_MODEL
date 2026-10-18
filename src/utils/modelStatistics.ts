import * as THREE from 'three';
import { ModelStats, BoundingBoxInfo } from '../types/viewer';

export function calculateModelStats(
  root: THREE.Object3D,
  filename: string,
  fileSize: number,
  loadTimeMs: number
): ModelStats {
  let verticesCount = 0;
  let trianglesCount = 0;
  let meshesCount = 0;
  let objectsCount = 0;
  let hasNormals = false;
  let hasColors = false;
  let hasTextures = false;

  const countedGeometries = new Set<string>();
  const countedMaterials = new Set<string>();

  root.traverse((child) => {
    objectsCount++;

    if (child instanceof THREE.Mesh) {
      meshesCount++;
      const geometry = child.geometry as THREE.BufferGeometry;

      if (geometry && !countedGeometries.has(geometry.uuid)) {
        countedGeometries.add(geometry.uuid);

        const positionAttr = geometry.getAttribute('position');
        if (positionAttr) {
          verticesCount += positionAttr.count;
        }

        if (geometry.index) {
          trianglesCount += geometry.index.count / 3;
        } else if (positionAttr) {
          trianglesCount += positionAttr.count / 3;
        }

        if (geometry.getAttribute('normal')) {
          hasNormals = true;
        }
        if (geometry.getAttribute('color')) {
          hasColors = true;
        }
      }

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (mat && !countedMaterials.has(mat.uuid)) {
          countedMaterials.add(mat.uuid);
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshPhongMaterial) {
            if (mat.map) {
              hasTextures = true;
            }
          }
        }
      });
    }
  });

  // Calculate bounding box in world space
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const extIndex = filename.lastIndexOf('.');
  const fileExtension = extIndex > -1 ? filename.slice(extIndex).toUpperCase() : '';

  const boundingBoxInfo: BoundingBoxInfo = {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
    center: { x: center.x, y: center.y, z: center.z },
    size: { x: size.x, y: size.y, z: size.z }
  };

  return {
    filename,
    fileExtension,
    fileSize,
    verticesCount: Math.round(verticesCount),
    facesCount: Math.round(trianglesCount), // In triangulated meshes, faces = triangles
    trianglesCount: Math.round(trianglesCount),
    meshesCount,
    objectsCount,
    materialsCount: countedMaterials.size,
    drawCalls: meshesCount, // initial estimate, updated dynamically by renderer.info
    boundingBox: boundingBoxInfo,
    hasNormals,
    hasColors,
    hasTextures,
    loadTimeMs
  };
}

/**
 * Disposes of all geometries, materials, and textures in an Object3D hierarchy
 */
export function disposeHierarchy(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => disposeMaterial(mat));
        } else {
          disposeMaterial(object.material);
        }
      }
    }
  });
}

function disposeMaterial(material: THREE.Material) {
  // Dispose attached textures
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key];
    if (value && typeof value === 'object' && 'isTexture' in value && (value as THREE.Texture).isTexture) {
      (value as THREE.Texture).dispose();
    }
  }
  material.dispose();
}
