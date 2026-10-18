import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export interface LoadModelResult {
  root: THREE.Group;
  materialsMap: Map<string, THREE.Material | THREE.Material[]>;
}

export function createCadDefaultMaterial(color: string = '#8EA0B5'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.35,
    metalness: 0.25,
    side: THREE.DoubleSide
  });
}

/**
 * Loads an OBJ or STL model from File or Blob or URL
 */
export async function loadModelFile(
  file: File,
  companionFiles: File[] = []
): Promise<LoadModelResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension !== 'obj' && extension !== 'stl') {
    throw new Error(`Unsupported format '.${extension}'. Please select an .OBJ or .STL file.`);
  }

  if (file.size === 0) {
    throw new Error(`The file '${file.name}' is empty (0 bytes).`);
  }

  // Handle STL file
  if (extension === 'stl') {
    return loadStlFile(file);
  }

  // Handle OBJ file
  return loadObjFile(file, companionFiles);
}

/**
 * Parses STL file (both binary and ASCII)
 */
async function loadStlFile(file: File): Promise<LoadModelResult> {
  const buffer = await file.arrayBuffer();
  const loader = new STLLoader();
  
  let geometry: THREE.BufferGeometry;
  try {
    geometry = loader.parse(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse STL file: ${msg}`);
  }

  if (!geometry.getAttribute('position') || geometry.getAttribute('position').count === 0) {
    throw new Error('STL file parsed but contains no 3D vertex positions.');
  }

  // Ensure vertex normals exist
  if (!geometry.getAttribute('normal')) {
    geometry.computeVertexNormals();
  }

  const material = createCadDefaultMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = file.name;

  const group = new THREE.Group();
  group.name = file.name;
  group.add(mesh);

  const materialsMap = new Map<string, THREE.Material | THREE.Material[]>();
  materialsMap.set(mesh.uuid, material);

  return { root: group, materialsMap };
}

/**
 * Parses OBJ file with optional MTL companion files
 */
async function loadObjFile(file: File, companionFiles: File[]): Promise<LoadModelResult> {
  const objLoader = new OBJLoader();
  const materialsMap = new Map<string, THREE.Material | THREE.Material[]>();

  // Check for .mtl file in companion files
  const mtlFile = companionFiles.find(f => f.name.toLowerCase().endsWith('.mtl'));
  if (mtlFile) {
    try {
      const mtlText = await mtlFile.text();
      const mtlLoader = new MTLLoader();
      const materialsCreator = mtlLoader.parse(mtlText, '');
      materialsCreator.preload();
      objLoader.setMaterials(materialsCreator);
    } catch (e) {
      console.warn('Could not parse companion MTL file, falling back to default material:', e);
    }
  }

  const objText = await file.text();
  let root: THREE.Group;

  try {
    root = objLoader.parse(objText);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse OBJ file: ${msg}`);
  }

  let hasMeshes = false;
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      hasMeshes = true;
      child.castShadow = true;
      child.receiveShadow = true;

      // Ensure geometry has normals
      if (child.geometry && !child.geometry.getAttribute('normal')) {
        child.geometry.computeVertexNormals();
      }

      // Check if material is default or needs cad material
      if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
        const defaultMat = createCadDefaultMaterial();
        child.material = defaultMat;
      } else {
        // DoubleSide helps with CAD models that don't have closed manifolds or single-sided normals
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.side = THREE.DoubleSide; });
        } else {
          child.material.side = THREE.DoubleSide;
        }
      }

      materialsMap.set(child.uuid, child.material);
    }
  });

  if (!hasMeshes) {
    throw new Error('OBJ file contains no valid 3D polygon meshes or geometry.');
  }

  root.name = file.name;
  return { root, materialsMap };
}

/**
 * Helper to parse OBJ from text string directly
 */
export function loadObjFromString(objText: string, name: string = 'model.obj'): LoadModelResult {
  const objLoader = new OBJLoader();
  const root = objLoader.parse(objText);
  const materialsMap = new Map<string, THREE.Material | THREE.Material[]>();

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.geometry && !child.geometry.getAttribute('normal')) {
        child.geometry.computeVertexNormals();
      }
      if (!child.material) {
        child.material = createCadDefaultMaterial();
      } else {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.side = THREE.DoubleSide; });
        } else {
          child.material.side = THREE.DoubleSide;
        }
      }
      materialsMap.set(child.uuid, child.material);
    }
  });

  root.name = name;
  return { root, materialsMap };
}

/**
 * Helper to parse STL from ArrayBuffer directly
 */
export function loadStlFromBuffer(
  buffer: ArrayBuffer,
  name: string = 'model.stl',
  materialColor: string = '#9BA6B2'
): LoadModelResult {
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);

  if (!geometry.getAttribute('normal')) {
    geometry.computeVertexNormals();
  }

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(materialColor),
    metalness: 0.45,
    roughness: 0.4,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = name;

  const group = new THREE.Group();
  group.name = name;
  group.add(mesh);

  const materialsMap = new Map<string, THREE.Material | THREE.Material[]>();
  materialsMap.set(mesh.uuid, material);

  return { root: group, materialsMap };
}

/**
 * Loads an STL model from a static URL (e.g. /models/WIND_TURBINE.stl)
 */
export async function loadStlFromUrl(
  url: string,
  name: string = 'WIND_TURBINE.stl'
): Promise<{ result: LoadModelResult; size: number }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${name} from ${url} (HTTP ${response.status}: ${response.statusText})`);
  }
  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const result = loadStlFromBuffer(buffer, name, '#9BA6B2');
  return { result, size };
}

