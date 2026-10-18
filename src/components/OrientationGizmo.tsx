import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ViewPreset } from '../types/viewer';

interface OrientationGizmoProps {
  camera: THREE.Camera | null;
  onSelectView: (view: ViewPreset) => void;
}

interface AxisNode {
  name: string;
  view: ViewPreset;
  color: string;
  fill: string;
  dir: THREE.Vector3;
  label: string;
  isNegative?: boolean;
}

const AXES_DEFINITIONS: AxisNode[] = [
  { name: '+X', view: 'RIGHT', color: '#FF4D4D', fill: '#FF4D4D', dir: new THREE.Vector3(1, 0, 0), label: 'X' },
  { name: '-X', view: 'LEFT', color: '#FF4D4D', fill: '#4D2020', dir: new THREE.Vector3(-1, 0, 0), label: '-X', isNegative: true },
  { name: '+Y', view: 'TOP', color: '#00E58B', fill: '#00E58B', dir: new THREE.Vector3(0, 1, 0), label: 'Y' },
  { name: '-Y', view: 'BOTTOM', color: '#00E58B', fill: '#144D2F', dir: new THREE.Vector3(0, -1, 0), label: '-Y', isNegative: true },
  { name: '+Z', view: 'FRONT', color: '#00BFFF', fill: '#00BFFF', dir: new THREE.Vector3(0, 0, 1), label: 'Z' },
  { name: '-Z', view: 'BACK', color: '#00BFFF', fill: '#153C54', dir: new THREE.Vector3(0, 0, -1), label: '-Z', isNegative: true },
];

export const OrientationGizmo: React.FC<OrientationGizmoProps> = ({ camera, onSelectView }) => {
  const [nodes, setNodes] = useState<{
    name: string;
    view: ViewPreset;
    color: string;
    fill: string;
    label: string;
    isNegative?: boolean;
    x: number;
    y: number;
    z: number;
  }[]>([]);

  const frameId = useRef<number | null>(null);

  useEffect(() => {
    if (!camera) return;

    const updateGizmo = () => {
      const invQuat = camera.quaternion.clone().invert();
      const cx = 50;
      const cy = 50;
      const radius = 30;

      const projected = AXES_DEFINITIONS.map((axis) => {
        const v = axis.dir.clone().applyQuaternion(invQuat);
        return {
          ...axis,
          x: cx + v.x * radius,
          y: cy - v.y * radius,
          z: v.z,
        };
      });

      // Sort back-to-front so front nodes render over back nodes
      projected.sort((a, b) => a.z - b.z);
      setNodes(projected);

      frameId.current = requestAnimationFrame(updateGizmo);
    };

    frameId.current = requestAnimationFrame(updateGizmo);

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [camera]);

  const cx = 50;
  const cy = 50;

  return (
    <div className="orientation-gizmo-container" id="orientation-gizmo" title="Click an axis to align view">
      <svg className="gizmo-canvas" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r="46" fill="rgba(16, 21, 29, 0.4)" stroke="#202B38" strokeWidth="1.5" />
        
        {/* Origin subtle dot */}
        <circle cx={cx} cy={cy} r="2" fill="#576375" />

        {/* Lines from center to positive axes */}
        {nodes
          .filter((n) => !n.isNegative)
          .map((n) => (
            <line
              key={`line-${n.name}`}
              x1={cx}
              y1={cy}
              x2={n.x}
              y2={n.y}
              stroke={n.color}
              strokeWidth={n.z >= 0 ? '2' : '1'}
              opacity={n.z >= 0 ? 0.9 : 0.4}
            />
          ))}

        {/* Axis Nodes */}
        {nodes.map((node) => {
          const isFront = node.z >= 0;
          const nodeRadius = node.isNegative ? (isFront ? 6 : 4) : isFront ? 9 : 7;
          const opacity = isFront ? 1 : 0.45;

          return (
            <g
              key={node.name}
              style={{ cursor: 'pointer', transition: 'all 0.1s' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectView(node.view);
              }}
            >
              <title>{`${node.name} View (${node.view})`}</title>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={node.fill}
                stroke={node.color}
                strokeWidth={isFront ? '1.5' : '1'}
                opacity={opacity}
              />
              {!node.isNegative && (
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9px"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="gizmo-axis-legend">
        <span style={{ color: '#FF4D4D' }}>X</span>
        <span style={{ color: '#00E58B' }}>Y</span>
        <span style={{ color: '#00BFFF' }}>Z</span>
      </div>
    </div>
  );
};
