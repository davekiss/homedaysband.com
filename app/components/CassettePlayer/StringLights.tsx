"use client";

import { useMemo } from "react";
import * as THREE from "three";

const WIRE_SEGMENTS = 64;

// One continuous strand that zigzags across the room, pinned at the walls
// and sagging between each pin point. Like someone strung one long strand
// back and forth across the ceiling.
// One strand zigzagging wall-to-wall, moving from back toward camera.
// Pinned high on walls, sagging naturally between pins.
// Pattern: left wall → right wall → left wall → right wall (front)
const PIN_POINTS: [number, number, number][] = [
  [-7.5, 3.4, -5.5],   // pin: left wall, far back
  [0, 2.4, -5],        // sag: center
  [7.5, 3.4, -4],      // pin: right wall, back

  [0, 2.3, -2.5],      // sag: center
  [-7.5, 3.3, -1],     // pin: left wall, mid-room

  [0, 2.2, 0.5],       // sag: center
  [7.5, 3.3, 2],       // pin: right wall, forward

  [0, 2.1, 3.5],       // sag: center
  [-7.5, 3.2, 4.5],    // pin: left wall, near front
];

const BULBS_PER_SEGMENT = 8;

// Which segments get a real point light (at their midpoint)
const LIT_SEGMENTS = [0, 2, 4, 6];

function Wire({ curve }: { curve: THREE.Curve<THREE.Vector3> }) {
  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, WIRE_SEGMENTS, 0.01, 5, false);
  }, [curve]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#1a1a18" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

function Bulb({ position }: { position: THREE.Vector3 }) {
  return (
    <group position={[position.x, position.y - 0.05, position.z]}>
      {/* Socket */}
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.016, 0.012, 0.03, 6]} />
        <meshStandardMaterial color="#2a2a28" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Bulb */}
      <mesh>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial
          color="#f5d8a0"
          emissive="#f5c870"
          emissiveIntensity={2.5}
          roughness={0.3}
          metalness={0}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

export default function StringLights() {
  // Build one continuous CatmullRom curve through all pin points
  const curve = useMemo(() => {
    const points = PIN_POINTS.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.3);
  }, []);

  // Sample bulb positions evenly along the entire strand
  const totalBulbs = (PIN_POINTS.length - 1) * BULBS_PER_SEGMENT;
  const bulbPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < totalBulbs; i++) {
      const t = (i + 0.5) / totalBulbs;
      positions.push(curve.getPoint(t));
    }
    return positions;
  }, [curve, totalBulbs]);

  // Place real point lights at the midpoint of certain segments
  const lightPositions = useMemo(() => {
    return LIT_SEGMENTS.map((seg) => {
      const t = (seg + 0.5) / (PIN_POINTS.length - 1);
      return curve.getPoint(t);
    });
  }, [curve]);

  return (
    <group>
      <Wire curve={curve} />
      {bulbPositions.map((pos, i) => (
        <Bulb key={i} position={pos} />
      ))}
      {lightPositions.map((pos, i) => (
        <pointLight
          key={i}
          position={[pos.x, pos.y - 0.1, pos.z]}
          intensity={2.5}
          color="#f5c870"
          distance={6}
          decay={2}
        />
      ))}
    </group>
  );
}
