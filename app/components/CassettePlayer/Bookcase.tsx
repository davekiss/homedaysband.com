"use client";

// Built-in bookcase. Two fixed shelves split the interior into three
// compartments; each shelf is populated with books (drawn as a single
// InstancedMesh per row so a dozen-plus spines become one draw call),
// plus a leaning empty picture frame on the middle shelf and a little
// honey-colored teddy bear on the top shelf.
//
// Self-contained — to remove, delete the <Bookcase /> line and import
// in Scene.tsx along with this file. Reposition with the `position`
// prop; default orientation has the bookcase facing -z, so if you
// want it on a side wall pass `rotation={[0, ±Math.PI / 2, 0]}`.

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type BookcaseProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
};

// Tiny seeded RNG so book widths/heights/colors stay stable across
// re-renders without adding a dependency.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A row of instanced book spines sitting on a shelf. `innerW` is the
// horizontal space between the case sides, and leftPad/rightPad carve
// out a gap at each end so books don't sit wall-to-wall (leaves room
// for the picture frame, the bear, or just some breathing room).
function BookRow({
  y,
  z,
  innerW,
  seed,
  leftPad = 0,
  rightPad = 0,
}: {
  y: number;
  z: number;
  innerW: number;
  seed: number;
  leftPad?: number;
  rightPad?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { count, matrices, colors } = useMemo(() => {
    // Muted library-spine palette — dark leathers, worn clothbound
    // covers, faded jackets. A small per-book HSL jitter keeps each
    // color from looking stamped.
    const palette = [
      "#5a2f2f", "#2c3e4f", "#4a5a2a", "#6b4423", "#3d3540",
      "#7a3b2e", "#2f5146", "#8b6b3c", "#4b2c44", "#1e3a5f",
      "#6e4e2a", "#352d28",
    ];
    const rnd = mulberry32(seed);
    const availableW = innerW - leftPad - rightPad;
    const startX = -innerW / 2 + leftPad;
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];

    let cursorX = startX;
    const maxX = startX + availableW;
    let i = 0;
    while (true) {
      const w = 0.03 + rnd() * 0.05;
      const h = 0.44 + rnd() * 0.16;
      const d = 0.14 + rnd() * 0.04;
      if (cursorX + w > maxX) break;
      // Once in a while a book leans against its neighbor — just a
      // small Z-axis tilt so not every spine is perfectly vertical.
      const lean = rnd() < 0.14 ? (rnd() - 0.5) * 0.22 : 0;
      const trans = new THREE.Matrix4().makeTranslation(
        cursorX + w / 2,
        y + h / 2,
        z
      );
      const rot = new THREE.Matrix4().makeRotationZ(lean);
      const scale = new THREE.Matrix4().makeScale(w, h, d);
      const m = new THREE.Matrix4()
        .multiplyMatrices(trans, rot)
        .multiply(scale);
      mats.push(m);
      const base = new THREE.Color(palette[i % palette.length]);
      base.offsetHSL(
        (rnd() - 0.5) * 0.04,
        (rnd() - 0.5) * 0.15,
        (rnd() - 0.5) * 0.08
      );
      cols.push(base);
      cursorX += w + 0.003;
      i += 1;
    }
    return { count: mats.length, matrices: mats, colors: cols };
  }, [y, z, innerW, seed, leftPad, rightPad]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, matrices, colors]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.85} metalness={0.03} />
    </instancedMesh>
  );
}

// Mossy forest monster in the Where The Wild Things Are vibe — a
// chunky hand-made looking creature with horns, big amber eyes, and
// a toothy grin. Sits on its rump with its legs stretched forward
// (toward the viewer). `position` is the shelf anchor; the creature
// builds up from y=0 so callers can drop it on a shelf by passing
// the shelf surface y.
function ForestMonster({
  position,
}: {
  position: [number, number, number];
}) {
  const furColor = "#3f5a36";    // mossy dark green
  const bellyColor = "#7e8a46";  // lichen yellow-green
  const hornColor = "#d8cca8";   // aged bone
  const eyeWhite = "#f2e8b6";    // warm amber highlight
  const pupilColor = "#0a0806";
  const toothColor = "#ece4ca";
  const mouthColor = "#1a0a06";
  const furMat = (
    <meshStandardMaterial color={furColor} roughness={0.95} metalness={0.0} />
  );
  const bellyMat = (
    <meshStandardMaterial color={bellyColor} roughness={0.95} metalness={0.0} />
  );

  return (
    <group position={position}>
      {/* Legs extended forward (toward -z = toward viewer). Each is a
          cylinder lying flat with a rounded foot pad and three toe
          bumps on the end. */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.055, 0.042, -0.06]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.042, 0.036, 0.14, 12]} />
            {furMat}
          </mesh>
          {/* Foot pad */}
          <mesh position={[0, -0.004, -0.08]} castShadow>
            <sphereGeometry args={[0.048, 12, 10]} />
            {furMat}
          </mesh>
          {/* Toe bumps */}
          {[-0.022, 0, 0.022].map((tx, j) => (
            <mesh
              key={j}
              position={[tx, -0.015, -0.105]}
              castShadow
            >
              <sphereGeometry args={[0.015, 8, 6]} />
              {furMat}
            </mesh>
          ))}
        </group>
      ))}

      {/* Rump — big fuzzy base, slightly squashed so it reads as
          "sitting on its butt" rather than floating. */}
      <mesh position={[0, 0.12, 0.02]} scale={[1, 0.9, 1]} castShadow>
        <sphereGeometry args={[0.115, 16, 14]} />
        {furMat}
      </mesh>

      {/* Belly patch — lighter lichen color across the front */}
      <mesh position={[0, 0.14, -0.055]} scale={[0.55, 0.8, 0.35]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        {bellyMat}
      </mesh>

      {/* Torso — a second ball stacked on top of the rump for a
          top-heavy Wild Things silhouette. */}
      <mesh position={[0, 0.23, 0.005]} castShadow>
        <sphereGeometry args={[0.1, 16, 14]} />
        {furMat}
      </mesh>

      {/* Stubby arms hanging at the sides, angled slightly forward
          like they're resting on the legs. */}
      {[-1, 1].map((side, i) => (
        <group key={i}>
          <mesh
            position={[side * 0.115, 0.17, -0.015]}
            rotation={[0.35, 0, side * 0.4]}
            castShadow
          >
            <cylinderGeometry args={[0.033, 0.028, 0.12, 10]} />
            {furMat}
          </mesh>
          {/* Paw */}
          <mesh position={[side * 0.13, 0.105, -0.05]} castShadow>
            <sphereGeometry args={[0.036, 12, 10]} />
            {furMat}
          </mesh>
        </group>
      ))}

      {/* Oversized head */}
      <mesh position={[0, 0.36, 0.005]} castShadow>
        <sphereGeometry args={[0.115, 18, 16]} />
        {furMat}
      </mesh>

      {/* Snout / muzzle — protrudes forward on the lower half of the
          head, bellycolor so it pops against the fur. */}
      <mesh position={[0, 0.32, -0.085]} scale={[0.85, 0.7, 1]} castShadow>
        <sphereGeometry args={[0.062, 14, 12]} />
        {bellyMat}
      </mesh>

      {/* Horns — bone-colored cones curving up and out from the
          crown of the head. */}
      {[-1, 1].map((side, i) => (
        <mesh
          key={i}
          position={[side * 0.07, 0.475, 0.015]}
          rotation={[-0.15, 0, side * -0.4]}
          castShadow
        >
          <coneGeometry args={[0.024, 0.1, 10]} />
          <meshStandardMaterial
            color={hornColor}
            roughness={0.55}
            metalness={0.12}
          />
        </mesh>
      ))}

      {/* Tufty rounded ears at the sides of the head */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.11, 0.4, 0.02]} castShadow>
          <sphereGeometry args={[0.03, 10, 8]} />
          {furMat}
        </mesh>
      ))}

      {/* Big amber eyes with dark pupils — placed forward on the
          head so they actually face the viewer. */}
      {[-1, 1].map((side, i) => (
        <group key={i}>
          <mesh position={[side * 0.04, 0.385, -0.095]} castShadow>
            <sphereGeometry args={[0.025, 14, 12]} />
            <meshStandardMaterial
              color={eyeWhite}
              roughness={0.3}
              emissive={eyeWhite}
              emissiveIntensity={0.08}
            />
          </mesh>
          <mesh position={[side * 0.04, 0.383, -0.116]}>
            <sphereGeometry args={[0.01, 10, 8]} />
            <meshStandardMaterial color={pupilColor} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Mouth — a dark recessed slit just under the snout */}
      <mesh position={[0, 0.295, -0.128]}>
        <boxGeometry args={[0.07, 0.014, 0.006]} />
        <meshStandardMaterial color={mouthColor} roughness={0.8} />
      </mesh>

      {/* A few blunt teeth dropping from the top of the mouth */}
      {[-0.022, 0, 0.022].map((tx, i) => (
        <mesh
          key={i}
          position={[tx, 0.288, -0.129]}
          rotation={[Math.PI, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.005, 0.013, 4]} />
          <meshStandardMaterial color={toothColor} roughness={0.5} />
        </mesh>
      ))}

      {/* Curled tail off the back-right of the rump */}
      <mesh
        position={[0.1, 0.09, 0.11]}
        rotation={[0.6, -0.3, 0.7]}
        castShadow
      >
        <cylinderGeometry args={[0.028, 0.012, 0.11, 10]} />
        {furMat}
      </mesh>
    </group>
  );
}

// Empty wooden picture frame — four rails around a cream "canvas".
function PictureFrame({
  position,
  rotation = [0, 0, 0],
  width = 0.3,
  height = 0.4,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const railW = 0.035;
  const depth = 0.025;
  const woodColor = "#5a3a22";
  const innerColor = "#e8e2d4";
  const railMat = (
    <meshStandardMaterial color={woodColor} roughness={0.55} metalness={0.05} />
  );
  return (
    <group position={position} rotation={rotation}>
      {/* Top rail */}
      <mesh position={[0, height / 2 - railW / 2, 0]} castShadow>
        <boxGeometry args={[width, railW, depth]} />
        {railMat}
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, -height / 2 + railW / 2, 0]} castShadow>
        <boxGeometry args={[width, railW, depth]} />
        {railMat}
      </mesh>
      {/* Left rail */}
      <mesh position={[-width / 2 + railW / 2, 0, 0]} castShadow>
        <boxGeometry args={[railW, height - railW * 2, depth]} />
        {railMat}
      </mesh>
      {/* Right rail */}
      <mesh position={[width / 2 - railW / 2, 0, 0]} castShadow>
        <boxGeometry args={[railW, height - railW * 2, depth]} />
        {railMat}
      </mesh>
      {/* Empty canvas — flat cream plane recessed inside the frame */}
      <mesh position={[0, 0, -depth / 2 + 0.003]}>
        <planeGeometry args={[width - railW * 2, height - railW * 2]} />
        <meshStandardMaterial color={innerColor} roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function Bookcase({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: BookcaseProps) {
  // Overall case dimensions
  const width = 2.0;
  const height = 2.7;
  const depth = 0.35;

  // Cabinetry — matches baseboard / door trim for a built-in feel
  const caseThickness = 0.04;
  const shelfThickness = 0.03;
  const trimColor = "#f0ece4";

  // Two shelves split the interior into three equal compartments.
  const innerH = height - caseThickness * 2;
  const compartmentH = innerH / 3;
  const bottomOfInterior = -height / 2 + caseThickness;
  const shelfY1 = bottomOfInterior + compartmentH;
  const shelfY2 = bottomOfInterior + compartmentH * 2;
  const shelfTop1 = shelfY1 + shelfThickness / 2;
  const shelfTop2 = shelfY2 + shelfThickness / 2;

  const innerW = width - caseThickness * 2;
  // Items sit slightly toward the back of the case (z > 0 in local
  // space, since the back panel is at +depth/2 and the open front is
  // at -depth/2).
  const itemZ = 0.05;

  const trimMat = (
    <meshStandardMaterial color={trimColor} roughness={0.6} metalness={0.05} />
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Back panel — flush with the wall side of the case */}
      <mesh
        position={[0, 0, depth / 2 - caseThickness / 2]}
        receiveShadow
      >
        <boxGeometry args={[width, height, caseThickness]} />
        {trimMat}
      </mesh>

      {/* Left side */}
      <mesh
        position={[-width / 2 + caseThickness / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[caseThickness, height, depth]} />
        {trimMat}
      </mesh>

      {/* Right side */}
      <mesh
        position={[width / 2 - caseThickness / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[caseThickness, height, depth]} />
        {trimMat}
      </mesh>

      {/* Top */}
      <mesh
        position={[0, height / 2 - caseThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, caseThickness, depth]} />
        {trimMat}
      </mesh>

      {/* Bottom */}
      <mesh
        position={[0, -height / 2 + caseThickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, caseThickness, depth]} />
        {trimMat}
      </mesh>

      {/* Top cap / crown — sits on the case and slightly overhangs
          the sides and front so the bookcase reads as a finished
          built-in rather than an open box. Depth matches the case so
          it covers the whole top surface, not just the front strip. */}
      <mesh
        position={[0, height / 2 + 0.03, -0.015]}
        castShadow
      >
        <boxGeometry args={[width + 0.06, 0.06, depth + 0.03]} />
        {trimMat}
      </mesh>

      {/* Lower shelf */}
      <mesh position={[0, shelfY1, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, shelfThickness, depth - 0.02]} />
        {trimMat}
      </mesh>

      {/* Upper shelf */}
      <mesh position={[0, shelfY2, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, shelfThickness, depth - 0.02]} />
        {trimMat}
      </mesh>

      {/* BOTTOM compartment — full row of books along the case bottom */}
      <BookRow
        y={bottomOfInterior + 0.001}
        z={itemZ}
        innerW={innerW}
        seed={101}
        leftPad={0.03}
        rightPad={0.03}
      />

      {/* MIDDLE compartment — books on the right half, empty picture
          frame leaning on the left half */}
      <BookRow
        y={shelfTop1 + 0.001}
        z={itemZ}
        innerW={innerW}
        seed={202}
        leftPad={0.55}
        rightPad={0.03}
      />
      <PictureFrame
        position={[-innerW / 2 + 0.22, shelfTop1 + 0.2, itemZ + 0.02]}
        rotation={[0.15, 0.1, -0.03]}
      />

      {/* TOP compartment — mossy forest monster sitting on the left,
          shorter row of books on the right */}
      <ForestMonster
        position={[-innerW / 2 + 0.22, shelfTop2, itemZ]}
      />
      <BookRow
        y={shelfTop2 + 0.001}
        z={itemZ}
        innerW={innerW}
        seed={303}
        leftPad={0.5}
        rightPad={0.03}
      />
    </group>
  );
}
