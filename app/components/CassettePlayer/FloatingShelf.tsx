"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Wall-mounted floating shelf with a little bonsai tree, a frosted globe
// lamp, and a couple of vinyl record sleeves leaning against the wall.
// Fully self-contained.
//
// Local space convention:
//   - y = 0 is the shelf top surface (items rest on top with y > 0)
//   - z = 0 is the wall plane at the back of the shelf
//   - +z points out from the wall; shelf front edge is at z = SHELF_D
//   - x runs along the wall
//
// Mount it on a wall by rotating so local +z faces into the room.
// For the left wall use rotation=[0, Math.PI/2, 0]; for the back wall
// use rotation=[0, 0, 0].
//
// To remove the whole shelf: delete <FloatingShelf /> from Scene.tsx
// and this file's import.
// To remove or re-arrange individual items: comment/edit the <Pothos />,
// <VinylRecords />, or <GlobeLight /> lines in the exported component.

const SHELF_W = 1.7;
const SHELF_D = 0.32;
const SHELF_T = 0.045;

const SHELF_WOOD_COLOR = "#5d3f25";
const SHELF_TRIM_COLOR = "#3a2616";

type FloatingShelfProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

// ---------------------------------------------------------------------------
// Shelf board
// ---------------------------------------------------------------------------
function ShelfBoard() {
  return (
    <group>
      {/* Main slab — top face sits exactly on local y = 0 */}
      <mesh
        position={[0, -SHELF_T / 2, SHELF_D / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[SHELF_W, SHELF_T, SHELF_D]} />
        <meshStandardMaterial
          color={SHELF_WOOD_COLOR}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      {/* Darker front-edge band — hints at a chamfered live-edge lip.
          Sits just in front of the slab face (not coplanar) to avoid
          z-fighting, and is slightly shorter in Y so its top/bottom
          don't fight with the slab top/bottom either. */}
      <mesh
        position={[0, -SHELF_T / 2, SHELF_D + 0.004]}
        castShadow
      >
        <boxGeometry args={[SHELF_W + 0.002, SHELF_T - 0.002, 0.008]} />
        <meshStandardMaterial color={SHELF_TRIM_COLOR} roughness={0.85} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Bonsai tree in a shallow ceramic pot. A gnarled twisting trunk built from
// a Catmull-Rom curve + TubeGeometry, a few thinner branches splaying off
// the trunk, and rounded "cloud pad" foliage clumps (flattened ellipsoids)
// at the branch tips.
// ---------------------------------------------------------------------------
function BonsaiTree({ x }: { x: number }) {
  const POT_W = 0.38;
  const POT_D = 0.24;
  const POT_H = 0.09;
  const RIM_T = 0.012;

  const BARK_COLOR = "#4a3220";
  const POT_COLOR = "#2a2420";
  const POT_RIM_COLOR = "#3a3430";
  const MOSS_COLOR = "#2a1a0e";
  const BUD_PINK = "#f6c6cf";
  const BUD_PINK_DEEP = "#e6909e";
  const BUD_WHITE = "#fbeef0";

  // Gnarled twisting trunk — a Catmull-Rom curve with several bends. The
  // path starts at the soil surface (y = 0 in the trunk's local frame) and
  // climbs up and slightly off-center with a couple of S-curve bends.
  const trunkGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(0.0, 0.0, 0.0),
      new THREE.Vector3(0.02, 0.05, 0.025),
      new THREE.Vector3(-0.025, 0.11, 0.03),
      new THREE.Vector3(-0.04, 0.17, -0.01),
      new THREE.Vector3(-0.005, 0.22, -0.035),
      new THREE.Vector3(0.04, 0.28, -0.01),
      new THREE.Vector3(0.05, 0.34, 0.035),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 48, 0.024, 10, false);
  }, []);

  // A few branches splaying off the upper trunk. Each is its own thin tube.
  const branchGeoms = useMemo(() => {
    const make = (pts: THREE.Vector3[], radius: number) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.TubeGeometry(curve, 20, radius, 8, false);
    };
    return [
      // Long left branch
      make(
        [
          new THREE.Vector3(-0.03, 0.2, -0.01),
          new THREE.Vector3(-0.09, 0.22, 0.01),
          new THREE.Vector3(-0.16, 0.24, 0.03),
          new THREE.Vector3(-0.2, 0.255, 0.05),
        ],
        0.011,
      ),
      // Right branch, sweeping back
      make(
        [
          new THREE.Vector3(0.035, 0.24, -0.02),
          new THREE.Vector3(0.1, 0.26, -0.04),
          new THREE.Vector3(0.17, 0.275, -0.02),
          new THREE.Vector3(0.21, 0.29, 0.01),
        ],
        0.01,
      ),
      // Short forward branch
      make(
        [
          new THREE.Vector3(0.01, 0.28, 0.0),
          new THREE.Vector3(0.04, 0.3, 0.05),
          new THREE.Vector3(0.06, 0.32, 0.09),
        ],
        0.009,
      ),
      // Crown branch at the top of the trunk
      make(
        [
          new THREE.Vector3(0.05, 0.34, 0.03),
          new THREE.Vector3(0.07, 0.39, 0.05),
          new THREE.Vector3(0.08, 0.43, 0.04),
        ],
        0.009,
      ),
    ];
  }, []);

  // Tiny budding flowers clustered at the branch tips. Each bud is a small
  // sphere; we mix pink and white so the clusters look like a cherry-blossom
  // bonsai just starting to bloom. Positions are deterministic so the tree
  // looks the same every render.
  const flowerBuds: Array<{
    pos: [number, number, number];
    radius: number;
    color: string;
  }> = [
    // Left branch tip cluster
    { pos: [-0.2,   0.27,  0.05 ], radius: 0.014, color: BUD_PINK      },
    { pos: [-0.185, 0.275, 0.06 ], radius: 0.011, color: BUD_PINK_DEEP },
    { pos: [-0.21,  0.265, 0.04 ], radius: 0.012, color: BUD_WHITE     },
    { pos: [-0.195, 0.285, 0.045], radius: 0.01,  color: BUD_PINK      },
    { pos: [-0.175, 0.265, 0.055], radius: 0.012, color: BUD_PINK      },
    { pos: [-0.205, 0.28,  0.06 ], radius: 0.009, color: BUD_WHITE     },
    { pos: [-0.165, 0.255, 0.04 ], radius: 0.011, color: BUD_PINK_DEEP },
    // Right branch tip cluster
    { pos: [ 0.215, 0.295, 0.015], radius: 0.014, color: BUD_PINK      },
    { pos: [ 0.225, 0.305, 0.005], radius: 0.011, color: BUD_PINK_DEEP },
    { pos: [ 0.2,   0.305, 0.025], radius: 0.012, color: BUD_WHITE     },
    { pos: [ 0.23,  0.285, 0.0  ], radius: 0.01,  color: BUD_PINK      },
    { pos: [ 0.205, 0.28,  0.015], radius: 0.012, color: BUD_PINK      },
    { pos: [ 0.185, 0.295, 0.005], radius: 0.009, color: BUD_WHITE     },
    { pos: [ 0.22,  0.315, 0.02 ], radius: 0.011, color: BUD_PINK_DEEP },
    // Forward branch tip cluster
    { pos: [ 0.06,  0.325, 0.095], radius: 0.013, color: BUD_PINK      },
    { pos: [ 0.07,  0.335, 0.105], radius: 0.01,  color: BUD_WHITE     },
    { pos: [ 0.05,  0.315, 0.085], radius: 0.011, color: BUD_PINK_DEEP },
    { pos: [ 0.075, 0.31,  0.1  ], radius: 0.009, color: BUD_PINK      },
    { pos: [ 0.045, 0.33,  0.105], radius: 0.011, color: BUD_PINK      },
    // Crown branch tip cluster
    { pos: [ 0.08,  0.435, 0.04 ], radius: 0.014, color: BUD_PINK      },
    { pos: [ 0.09,  0.445, 0.05 ], radius: 0.011, color: BUD_PINK_DEEP },
    { pos: [ 0.07,  0.445, 0.03 ], radius: 0.012, color: BUD_WHITE     },
    { pos: [ 0.085, 0.455, 0.045], radius: 0.01,  color: BUD_PINK      },
    { pos: [ 0.095, 0.43,  0.04 ], radius: 0.011, color: BUD_PINK      },
    { pos: [ 0.07,  0.425, 0.05 ], radius: 0.009, color: BUD_WHITE     },
    // A few extra blossoms scattered along the upper trunk for a fuller look
    { pos: [ 0.05,  0.34,  0.04 ], radius: 0.01,  color: BUD_PINK      },
    { pos: [ 0.03,  0.31,  0.03 ], radius: 0.009, color: BUD_PINK_DEEP },
    { pos: [-0.02,  0.25,  0.02 ], radius: 0.009, color: BUD_WHITE     },
  ];

  return (
    <group position={[x, 0, 0.16]} scale={0.7}>
      {/* Shallow rectangular ceramic pot */}
      <mesh position={[0, POT_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[POT_W, POT_H, POT_D]} />
        <meshStandardMaterial color={POT_COLOR} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Pot rim — slightly wider band wrapping the top edge */}
      <mesh position={[0, POT_H - RIM_T / 2, 0]} castShadow>
        <boxGeometry args={[POT_W + 0.012, RIM_T, POT_D + 0.012]} />
        <meshStandardMaterial color={POT_RIM_COLOR} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Dark soil / moss slab recessed into the pot opening */}
      <mesh position={[0, POT_H + 0.002, 0]}>
        <boxGeometry args={[POT_W - 0.03, 0.008, POT_D - 0.03]} />
        <meshStandardMaterial color={MOSS_COLOR} roughness={1.0} metalness={0.0} />
      </mesh>

      {/* Trunk + branches + foliage — anchored to the soil surface */}
      <group position={[0, POT_H + 0.006, 0]}>
        {/* Trunk */}
        <mesh geometry={trunkGeom} castShadow>
          <meshStandardMaterial
            color={BARK_COLOR}
            roughness={0.88}
            metalness={0.0}
          />
        </mesh>

        {/* Branches */}
        {branchGeoms.map((geom, i) => (
          <mesh key={i} geometry={geom} castShadow>
            <meshStandardMaterial
              color={BARK_COLOR}
              roughness={0.88}
              metalness={0.0}
            />
          </mesh>
        ))}

        {/* Tiny budding flowers at each branch tip */}
        {flowerBuds.map((bud, i) => (
          <mesh key={i} position={bud.pos} castShadow>
            <sphereGeometry args={[bud.radius, 10, 8]} />
            <meshStandardMaterial
              color={bud.color}
              roughness={0.55}
              metalness={0.0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Globe lamp — just a frosted glass sphere resting directly on the shelf
// ---------------------------------------------------------------------------
function GlobeLight({ x }: { x: number }) {
  const GLOBE_R = 0.15;
  // Sit the globe just barely above the shelf surface so it reads as resting
  // on the wood rather than floating or intersecting.
  const GLOBE_Y = GLOBE_R + 0.002;

  return (
    <group position={[x, 0, SHELF_D / 2]}>
      {/* Frosted glass globe */}
      <mesh position={[0, GLOBE_Y, 0]} castShadow receiveShadow>
        <sphereGeometry args={[GLOBE_R, 32, 22]} />
        <meshStandardMaterial
          color="#fff4dc"
          roughness={0.45}
          metalness={0.0}
          emissive="#f5d8a0"
          emissiveIntensity={0.85}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Soft warm point light radiating from inside the globe */}
      <pointLight
        position={[0, GLOBE_Y, 0]}
        intensity={4}
        color="#f5d8a0"
        distance={6}
        decay={2}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Two vinyl LP sleeves leaning back against the wall
// ---------------------------------------------------------------------------
function VinylRecords({ x }: { x: number }) {
  const SLEEVE = 0.48;
  const SLEEVE_T = 0.01;
  // Negative X rotation tips the sleeve top toward -Z (toward the wall).
  const LEAN = 0.2;

  // Sleeves are placed side-by-side (with a small middle overlap) rather
  // than stacked front-to-back, so the bigger sleeves don't pass through
  // each other. The burgundy sleeve also sits a touch further back in Z
  // so that in the small overlap zone it's always clearly behind.
  const SLEEVE_X = SLEEVE * 0.22;

  return (
    <group position={[x, 0, 0.18]}>
      {/* Sleeve 1 — deep indigo, on the left, leaning back against the wall */}
      <group rotation={[-LEAN, -0.05, 0.02]}>
        <mesh
          position={[-SLEEVE_X, SLEEVE / 2, SLEEVE_T / 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[SLEEVE, SLEEVE, SLEEVE_T]} />
          <meshStandardMaterial color="#1a3a68" roughness={0.88} metalness={0.0} />
        </mesh>
        {/* Gold circle graphic on the sleeve front */}
        <mesh
          position={[-SLEEVE_X, SLEEVE / 2, SLEEVE_T + 0.0006]}
        >
          <circleGeometry args={[SLEEVE * 0.32, 32]} />
          <meshStandardMaterial color="#d8b048" roughness={0.7} />
        </mesh>
      </group>

      {/* Sleeve 2 — burgundy, on the right, sitting a little further back */}
      <group rotation={[-LEAN - 0.03, 0.06, -0.03]}>
        <mesh
          position={[SLEEVE_X, SLEEVE / 2, -SLEEVE_T - 0.02]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[SLEEVE, SLEEVE, SLEEVE_T]} />
          <meshStandardMaterial color="#782218" roughness={0.88} metalness={0.0} />
        </mesh>
        {/* Concentric cream ring graphic on the sleeve front */}
        <mesh
          position={[SLEEVE_X, SLEEVE / 2, -SLEEVE_T - 0.02 + SLEEVE_T / 2 + 0.0006]}
        >
          <ringGeometry args={[SLEEVE * 0.18, SLEEVE * 0.32, 32]} />
          <meshStandardMaterial
            color="#e8d8c0"
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Exported assembly
// ---------------------------------------------------------------------------
export default function FloatingShelf({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: FloatingShelfProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <ShelfBoard />
      {/* Rearrange or delete any of these three lines to modify the shelf */}
      <GlobeLight x={-0.6} />
      <VinylRecords x={-0.05} />
      <BonsaiTree x={0.55} />
    </group>
  );
}
