"use client";

import * as THREE from "three";

// Simple Scandinavian-style tripod floor lamp — wooden angled legs meeting
// at a small black metal collar, slender pole, conical linen shade with a
// warm bulb inside. Easy to remove by deleting the <FloorLamp /> line in
// Scene.tsx and this file — no other scene code depends on it.

const LEG_SPREAD = 0.6;    // horizontal radius at the floor
const LEG_TOP_Y = 0.85;    // collar height where the three legs meet
const POLE_TOP_Y = 3.7;    // where the shade starts
const POLE_R = 0.028;

const SHADE_BOTTOM_Y = 3.7;
const SHADE_TOP_Y = 4.45;
const SHADE_BOTTOM_R = 0.46;
const SHADE_TOP_R = 0.34;

const WOOD_COLOR = "#8a5e3c";   // warm walnut/teak
const METAL_COLOR = "#1a1a1a";  // matte black
const SHADE_COLOR = "#ede3d0";  // warm linen

type FloorLampProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

// One wooden leg of the tripod. Goes from (LEG_SPREAD * dir, 0, _) at the
// floor up to (0, LEG_TOP_Y, 0) where all three meet under the collar.
function Leg({ angle }: { angle: number }) {
  const footX = Math.cos(angle) * LEG_SPREAD;
  const footZ = Math.sin(angle) * LEG_SPREAD;
  const dx = 0 - footX;
  const dy = LEG_TOP_Y;
  const dz = 0 - footZ;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const dir = new THREE.Vector3(dx, dy, dz).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir
  );

  return (
    <mesh
      position={[footX / 2, LEG_TOP_Y / 2, footZ / 2]}
      quaternion={quat}
      castShadow
    >
      <cylinderGeometry args={[0.028, 0.038, length, 12]} />
      <meshStandardMaterial color={WOOD_COLOR} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

export default function FloorLamp({
  position,
  rotation = [0, 0, 0],
}: FloorLampProps) {
  const poleLength = POLE_TOP_Y - LEG_TOP_Y;
  const shadeHeight = SHADE_TOP_Y - SHADE_BOTTOM_Y;
  const shadeMidY = (SHADE_BOTTOM_Y + SHADE_TOP_Y) / 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Three tripod legs — equally spaced around Y */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a, i) => (
        <Leg key={i} angle={a} />
      ))}

      {/* Small metal collar where the legs meet the pole */}
      <mesh position={[0, LEG_TOP_Y + 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.075, 0.08, 18]} />
        <meshStandardMaterial color={METAL_COLOR} roughness={0.45} metalness={0.75} />
      </mesh>

      {/* Slender matte-black pole */}
      <mesh position={[0, LEG_TOP_Y + 0.05 + poleLength / 2, 0]} castShadow>
        <cylinderGeometry args={[POLE_R, POLE_R, poleLength, 12]} />
        <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Conical linen shade — open cylinder, lit from inside */}
      <mesh position={[0, shadeMidY, 0]} castShadow>
        <cylinderGeometry
          args={[SHADE_TOP_R, SHADE_BOTTOM_R, shadeHeight, 36, 1, true]}
        />
        <meshStandardMaterial
          color={SHADE_COLOR}
          roughness={0.85}
          metalness={0.0}
          side={THREE.DoubleSide}
          emissive="#f8e4b8"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Top cap of the shade */}
      <mesh position={[0, SHADE_TOP_Y - 0.002, 0]}>
        <cylinderGeometry
          args={[SHADE_TOP_R - 0.003, SHADE_TOP_R - 0.003, 0.004, 32]}
        />
        <meshStandardMaterial color={SHADE_COLOR} roughness={0.85} />
      </mesh>

      {/* Soft warm bulb light inside the shade — casts a pool into the corner */}
      <pointLight
        position={[0, shadeMidY, 0]}
        intensity={6}
        color="#f5d7a4"
        distance={10}
        decay={2}
      />
    </group>
  );
}
