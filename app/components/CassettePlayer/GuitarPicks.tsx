"use client";

// Small casual pile of three guitar picks on the table. Self-contained —
// to remove, delete the <GuitarPicks /> line and import in Scene.tsx along
// with this file.

import { useMemo } from "react";
import * as THREE from "three";

type GuitarPicksProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

// Classic "351" guitar pick silhouette — rounded shoulders tapering to a
// rounded point. Built as a 2D Shape on the XY plane (point at -Y), then
// extruded for thickness, then rotated flat so the final geometry lies
// face-up on the XZ plane with the pick's point along +Z and thickness
// along +Y. A small bevel softens the edge so it catches the light.
function createPickGeometry(thickness: number) {
  const shape = new THREE.Shape();
  // Classic 351 proportions: maximum width sits at the shoulders just below
  // the rounded top, then curves inward down to a rounded point.
  const w = 0.023;     // shoulder half-width (widest point of the pick)
  const tipY = -0.024; // point (bottom)
  const topY = 0.016;  // shoulder line / start of the top arc
  shape.moveTo(0, tipY);
  // Right flank: tip → right shoulder. The second control point sits
  // slightly outside the shoulder so the flank bulges out a bit before
  // rolling into the top arc, giving the pick its chunky shouldered look.
  shape.bezierCurveTo(
    w * 0.55, tipY + 0.006,
    w * 1.08, topY - 0.010,
    w, topY
  );
  // Top arc: right shoulder → left shoulder, curving up and over.
  shape.bezierCurveTo(
    w * 0.70, topY + 0.012,
    -w * 0.70, topY + 0.012,
    -w, topY
  );
  // Left flank: left shoulder → tip, mirror of the right flank.
  shape.bezierCurveTo(
    -w * 1.08, topY - 0.010,
    -w * 0.55, tipY + 0.006,
    0, tipY
  );

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: 0.0007,
    bevelSegments: 2,
    curveSegments: 20,
  });
  // Center the extruded depth on the origin so the pick sits symmetrically
  // around its own Y midline after we rotate it flat.
  geo.translate(0, 0, -thickness / 2);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export default function GuitarPicks({
  position,
  rotation = [0, 0, 0],
}: GuitarPicksProps) {
  const thickness = 0.0022;
  // Shared geometry across all three picks — single allocation.
  const pickGeometry = useMemo(() => createPickGeometry(thickness), []);

  return (
    <group position={position} rotation={rotation} scale={2}>
      {/* All three picks lay flat on the table at the same y — just scattered
          casually next to each other rather than stacked. */}

      {/* Tortoise-shell amber */}
      <mesh
        geometry={pickGeometry}
        position={[-0.036, thickness * 0.5, 0.008]}
        rotation={[0, 0.4, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#c87a2a"
          roughness={0.28}
          metalness={0.05}
          emissive="#3a1800"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Off-white celluloid */}
      <mesh
        geometry={pickGeometry}
        position={[0.014, thickness * 0.5, -0.024]}
        rotation={[0, -0.55, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#ece3cd" roughness={0.32} metalness={0.05} />
      </mesh>

      {/* Glossy black */}
      <mesh
        geometry={pickGeometry}
        position={[0.034, thickness * 0.5, 0.028]}
        rotation={[0, 1.1, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1612" roughness={0.28} metalness={0.08} />
      </mesh>
    </group>
  );
}
