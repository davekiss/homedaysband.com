"use client";

import * as THREE from "three";

type GuitarStandProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

// Compact folding A-frame guitar stand (K&M style). Two legs meet at
// a padded top block, each leg has a horizontal foot tube with rubber
// end caps, and two curved cradle arms extend forward to hold the
// guitar body.
export default function GuitarStand({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: GuitarStandProps) {
  const tubeMat = (
    <meshStandardMaterial color="#1a1a1a" roughness={0.35} metalness={0.75} />
  );
  const rubberMat = (
    <meshStandardMaterial color="#111111" roughness={0.95} metalness={0.0} />
  );

  const tubeR = 0.035;
  const topH = 1.6;       // height of the top junction block
  const legLen = 1.7;     // length of each A-frame leg
  const legAngle = 0.32;  // splay angle of each leg from vertical
  const footLen = 0.5;    // length of horizontal foot tubes
  const armLen = 0.55;    // length of each cradle arm
  const armUpLen = 0.2;   // upward tip at end of each arm

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* === Top junction block === */}
      <mesh position={[0, topH, 0]}>
        <boxGeometry args={[0.16, 0.14, 0.1]} />
        <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* === A-frame legs (two, splaying left and right) === */}
      {[-1, 1].map((side) => {
        const footX = Math.sin(legAngle) * legLen * side;
        const footY = topH - Math.cos(legAngle) * legLen;
        return (
          <group key={`leg-${side}`}>
            {/* Leg tube */}
            <mesh
              position={[footX / 2, (topH + footY) / 2, 0]}
              rotation={[0, 0, side * legAngle]}
            >
              <cylinderGeometry args={[tubeR, tubeR, legLen, 8]} />
              {tubeMat}
            </mesh>

            {/* Horizontal foot tube (perpendicular to leg direction) */}
            <mesh
              position={[footX, footY, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[tubeR * 1.2, tubeR * 1.2, footLen, 8]} />
              {tubeMat}
            </mesh>

            {/* Rubber end caps on foot tube */}
            {[-1, 1].map((end) => (
              <mesh
                key={`cap-${end}`}
                position={[footX, footY, end * footLen / 2]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[tubeR * 1.4, tubeR * 1.4, 0.06, 8]} />
                {rubberMat}
              </mesh>
            ))}

            {/* Cradle arm — extends forward from lower leg, then curves up */}
            {/* Horizontal portion */}
            <mesh
              position={[footX * 0.7, footY + 0.15, armLen / 2 + 0.02]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[tubeR, tubeR, armLen, 8]} />
              {tubeMat}
            </mesh>
            {/* Upward curved tip */}
            <mesh
              position={[footX * 0.7, footY + 0.15 + armUpLen / 2, armLen + 0.02]}
              rotation={[0.3, 0, 0]}
            >
              <cylinderGeometry args={[tubeR, tubeR, armUpLen, 8]} />
              {tubeMat}
            </mesh>
            {/* Rubber tip on arm end */}
            <mesh position={[footX * 0.7, footY + 0.15 + armUpLen, armLen + 0.05]}>
              <cylinderGeometry args={[tubeR * 1.3, tubeR * 1.3, 0.05, 8]} />
              {rubberMat}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
