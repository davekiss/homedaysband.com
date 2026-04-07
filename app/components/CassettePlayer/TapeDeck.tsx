"use client";

import React, { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import VolumeDial from "./VolumeDial";

// Horizontal grill slats — brown plastic with a slight sheen.
// `exclude` is an optional rectangular region in X/Z that the slats and
// backing should skip — used so the grill doesn't cap over the recessed
// tape well opening.
function GrillSlats({
  position,
  width,
  height,
  exclude,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  exclude?: { xMin: number; xMax: number; zMin: number; zMax: number };
}) {
  const slatCount = 28;
  const slatHeight = height / (slatCount * 1.5 + 0.5); // slat + gap ratio
  const gapHeight = slatHeight * 0.5;
  const slats: React.ReactElement[] = [];

  const slatLeft = position[0] - width / 2;
  const slatRight = position[0] + width / 2;

  // For a given slat that lives at world-Z = z with thickness slatHeight,
  // decide whether it overlaps the excluded Z band. If so, render two
  // chunks (left and right of the exclusion). Otherwise render one.
  const pushSlat = (z: number, key: string) => {
    const mat = (
      <meshStandardMaterial
        color="#6b4a30"
        roughness={0.35}
        metalness={0.15}
      />
    );
    const zHalf = slatHeight / 2;
    const overlapsZ =
      exclude && z + zHalf > exclude.zMin && z - zHalf < exclude.zMax;

    if (!overlapsZ || !exclude) {
      slats.push(
        <mesh key={key} position={[position[0], position[1], z]} castShadow>
          <boxGeometry args={[width, 0.015, slatHeight]} />
          {mat}
        </mesh>
      );
      return;
    }

    // Left chunk — from slatLeft to exclude.xMin
    if (exclude.xMin > slatLeft) {
      const w = exclude.xMin - slatLeft;
      const cx = (slatLeft + exclude.xMin) / 2;
      slats.push(
        <mesh key={`${key}-l`} position={[cx, position[1], z]} castShadow>
          <boxGeometry args={[w, 0.015, slatHeight]} />
          {mat}
        </mesh>
      );
    }
    // Right chunk — from exclude.xMax to slatRight
    if (exclude.xMax < slatRight) {
      const w = slatRight - exclude.xMax;
      const cx = (exclude.xMax + slatRight) / 2;
      slats.push(
        <mesh key={`${key}-r`} position={[cx, position[1], z]} castShadow>
          <boxGeometry args={[w, 0.015, slatHeight]} />
          {mat}
        </mesh>
      );
    }
  };

  for (let i = 0; i < slatCount; i++) {
    const z =
      position[2] -
      height / 2 +
      slatHeight / 2 +
      i * (slatHeight + gapHeight);
    pushSlat(z, `s${i}`);
  }

  // Dark backing — also split around the exclusion so we don't cap the
  // well opening with a dark ceiling just below the deck surface.
  const backingPieces: React.ReactElement[] = [];
  const backMat = (
    <meshStandardMaterial color="#1a1210" roughness={0.9} />
  );
  const zBack = position[2] - height / 2;
  const zFront = position[2] + height / 2;
  if (!exclude) {
    backingPieces.push(
      <mesh key="back" position={[position[0], position[1] - 0.01, position[2]]}>
        <boxGeometry args={[width, 0.005, height]} />
        {backMat}
      </mesh>
    );
  } else {
    // Piece 1: z from zBack to exclude.zMin (full width)
    if (exclude.zMin > zBack) {
      const d = exclude.zMin - zBack;
      const cz = (zBack + exclude.zMin) / 2;
      backingPieces.push(
        <mesh key="bb" position={[position[0], position[1] - 0.01, cz]}>
          <boxGeometry args={[width, 0.005, d]} />
          {backMat}
        </mesh>
      );
    }
    // Piece 2: z from exclude.zMax to zFront (full width)
    if (exclude.zMax < zFront) {
      const d = zFront - exclude.zMax;
      const cz = (exclude.zMax + zFront) / 2;
      backingPieces.push(
        <mesh key="bf" position={[position[0], position[1] - 0.01, cz]}>
          <boxGeometry args={[width, 0.005, d]} />
          {backMat}
        </mesh>
      );
    }
    // Piece 3: inside excluded Z band, left of the well
    const midZd = Math.min(exclude.zMax, zFront) - Math.max(exclude.zMin, zBack);
    if (midZd > 0) {
      const midCz =
        (Math.max(exclude.zMin, zBack) + Math.min(exclude.zMax, zFront)) / 2;
      if (exclude.xMin > slatLeft) {
        const w = exclude.xMin - slatLeft;
        const cx = (slatLeft + exclude.xMin) / 2;
        backingPieces.push(
          <mesh key="bml" position={[cx, position[1] - 0.01, midCz]}>
            <boxGeometry args={[w, 0.005, midZd]} />
            {backMat}
          </mesh>
        );
      }
      if (exclude.xMax < slatRight) {
        const w = slatRight - exclude.xMax;
        const cx = (exclude.xMax + slatRight) / 2;
        backingPieces.push(
          <mesh key="bmr" position={[cx, position[1] - 0.01, midCz]}>
            <boxGeometry args={[w, 0.005, midZd]} />
            {backMat}
          </mesh>
        );
      }
    }
  }

  return (
    <group>
      {backingPieces}
      {slats}
    </group>
  );
}

// Oval speaker grille on the left side
function SpeakerGrille({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  // Oval: wide in X, taller in Z
  const ovalW = height * 1.25; // X extent — wider oval
  const ovalH = 0.65; // Z extent (taller)
  const supportWidth = 0.025;

  // Vertical bars at center, 25% left, 25% right
  const barPositions = [-ovalW * 0.25, 0, ovalW * 0.25];

  return (
    <group position={position}>
      {/* Oval speaker opening — dark recessed area, wide and short */}
      <mesh position={[0, -0.005, 0]} scale={[ovalW / ovalH, 1, 1]}>
        <cylinderGeometry args={[ovalH / 2, ovalH / 2, 0.02, 48]} />
        <meshStandardMaterial color="#0a0808" roughness={0.95} />
      </mesh>
      {/* Speaker cone visible inside */}
      <mesh position={[0, -0.01, 0]} scale={[ovalW / ovalH, 1, 1]}>
        <cylinderGeometry args={[ovalH / 2 - 0.04, ovalH / 2 - 0.06, 0.01, 32]} />
        <meshStandardMaterial color="#1a1614" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Vertical support bars — on top of oval, underneath horizontal slats */}
      {barPositions.map((x, i) => {
        // Calculate bar height (Z extent) to fit within the oval at this X position
        // Ellipse: (x/a)^2 + (z/b)^2 = 1, solve for z
        const a = ovalW / 2;
        const b = ovalH / 2;
        const ratio = Math.abs(x) / a;
        const barH = ratio < 1 ? 2 * b * Math.sqrt(1 - ratio * ratio) : 0;
        return (
          <mesh key={i} position={[x, 0.003, 0]}>
            <boxGeometry args={[supportWidth, 0.012, barH * 0.92]} />
            <meshStandardMaterial
              color="#6b4a30"
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function TapeDeck({
  volume,
  onVolumeChange,
  setOrbitEnabled,
}: {
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  setOrbitEnabled?: (enabled: boolean) => void;
}) {
  const brushedMetalTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#5a5650";
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 800; i++) {
      const y = Math.random() * 512;
      ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Layout constants
  const deckW = 2.8;
  const deckD = 1.6;
  const deckH = 0.32;
  const grillZone = deckD * 0.75; // 75% of depth is grill area
  const faceplateZone = deckD - grillZone; // front 25% is cream faceplate
  // Grill centered in the back portion: starts at -deckD/2, ends at -deckD/2 + grillZone
  const grillCenterZ = -deckD / 2 + grillZone / 2;

  // Speaker on the left side of the grill
  const speakerX = -0.6;

  // Tape well right next to the speaker, in the grill zone
  const tapeWellX = 0.70;
  const tapeWellZ = grillCenterZ;

  // Tape well cavity — recessed pocket cut into the top of the deck so
  // inserted tapes drop INTO the machine rather than sit on top of it.
  // The opening matches the old tape-well footprint; the floor sits at
  // y=-wellDepth below the deck's top surface.
  const wellW = 1.1;
  const wellD = 0.75;
  const wellDepth = 0.11;
  const wellLeft = tapeWellX - wellW / 2;   // 0.15
  const wellRight = tapeWellX + wellW / 2;  // 1.25
  const wellBack = tapeWellZ - wellD / 2;   // -0.575
  const wellFront = tapeWellZ + wellD / 2;  // 0.175

  return (
    <group>
      {/* === Main deck body === shortened so its top stops at the well
          floor (y = -wellDepth). The volume above the floor is filled in
          around the well opening by 4 "rim" pieces, leaving the well
          itself hollow so inserted tapes sit INSIDE the machine. */}
      <mesh
        receiveShadow
        position={[0, (-deckH - wellDepth) / 2, 0]}
      >
        <boxGeometry args={[deckW, deckH - wellDepth, deckD]} />
        <meshStandardMaterial
          map={brushedMetalTexture}
          color="#5a5650"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Deck body rim — 4 pieces around the well opening, each
          `wellDepth` tall, filling the volume between the well floor
          (y=-wellDepth) and the deck top (y=0). Using the same brushed
          metal material so they read as the same body. */}
      {(() => {
        const rimY = -wellDepth / 2;
        const rimMat = (
          <meshStandardMaterial
            map={brushedMetalTexture}
            color="#5a5650"
            roughness={0.6}
            metalness={0.2}
          />
        );
        // Left rim: from deck left (-deckW/2) to well left edge
        const leftW = wellLeft - -deckW / 2;
        const leftCenterX = (-deckW / 2 + wellLeft) / 2;
        // Right rim: from well right edge to deck right
        const rightW = deckW / 2 - wellRight;
        const rightCenterX = (wellRight + deckW / 2) / 2;
        // Back rim: only covers x within the well, from deck back to well back
        const backD = wellBack - -deckD / 2;
        const backCenterZ = (-deckD / 2 + wellBack) / 2;
        // Front rim: only covers x within the well, from well front to deck front
        const frontD = deckD / 2 - wellFront;
        const frontCenterZ = (wellFront + deckD / 2) / 2;
        return (
          <>
            <mesh receiveShadow position={[leftCenterX, rimY, 0]}>
              <boxGeometry args={[leftW, wellDepth, deckD]} />
              {rimMat}
            </mesh>
            <mesh receiveShadow position={[rightCenterX, rimY, 0]}>
              <boxGeometry args={[rightW, wellDepth, deckD]} />
              {rimMat}
            </mesh>
            <mesh receiveShadow position={[tapeWellX, rimY, backCenterZ]}>
              <boxGeometry args={[wellW, wellDepth, backD]} />
              {rimMat}
            </mesh>
            <mesh receiveShadow position={[tapeWellX, rimY, frontCenterZ]}>
              <boxGeometry args={[wellW, wellDepth, frontD]} />
              {rimMat}
            </mesh>
          </>
        );
      })()}

      {/* Top plate — split into 4 pieces around the well opening so the
          hole in the top plate lines up with the hole in the body. */}
      {(() => {
        const plateY = 0.001;
        const plateThickness = 0.005;
        const plateW = deckW - 0.1;
        const plateD = deckD - 0.1;
        const plateLeftX = -plateW / 2;
        const plateRightX = plateW / 2;
        const plateBackZ = -plateD / 2;
        const plateFrontZ = plateD / 2;
        const plateMat = (
          <meshStandardMaterial color="#6a665e" roughness={0.5} metalness={0.3} />
        );
        const lW = wellLeft - plateLeftX;
        const lCx = (plateLeftX + wellLeft) / 2;
        const rW = plateRightX - wellRight;
        const rCx = (wellRight + plateRightX) / 2;
        const bD = wellBack - plateBackZ;
        const bCz = (plateBackZ + wellBack) / 2;
        const fD = plateFrontZ - wellFront;
        const fCz = (wellFront + plateFrontZ) / 2;
        return (
          <>
            <mesh receiveShadow position={[lCx, plateY, 0]}>
              <boxGeometry args={[lW, plateThickness, plateD]} />
              {plateMat}
            </mesh>
            <mesh receiveShadow position={[rCx, plateY, 0]}>
              <boxGeometry args={[rW, plateThickness, plateD]} />
              {plateMat}
            </mesh>
            <mesh receiveShadow position={[tapeWellX, plateY, bCz]}>
              <boxGeometry args={[wellW, plateThickness, bD]} />
              {plateMat}
            </mesh>
            <mesh receiveShadow position={[tapeWellX, plateY, fCz]}>
              <boxGeometry args={[wellW, plateThickness, fD]} />
              {plateMat}
            </mesh>
          </>
        );
      })()}

      {/* === GRILL SECTION — back 75%, full width === */}
      <GrillSlats
        position={[0, 0.005, grillCenterZ]}
        width={deckW}
        height={grillZone - 0.1}
        exclude={{
          xMin: wellLeft,
          xMax: wellRight,
          zMin: wellBack,
          zMax: wellFront,
        }}
      />

      {/* Speaker grille — left side, underneath the slats */}
      <SpeakerGrille
        position={[speakerX, 0.005, grillCenterZ]}
        height={grillZone - 0.1}
      />

      {/* === CREAM FACEPLATE — front 25% === */}
      <mesh position={[0, 0.005, deckD / 2 - faceplateZone / 2]} receiveShadow>
        <boxGeometry args={[deckW - 0.05, 0.01, faceplateZone]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.7} metalness={0.02} />
      </mesh>

      {/* === TAPE WELL CAVITY === */}
      {/* Dark well floor at the bottom of the recess. Slightly above
          the shortened deck body's top (y = -wellDepth) to avoid
          z-fighting. */}
      <mesh position={[tapeWellX, -wellDepth + 0.002, tapeWellZ]} receiveShadow>
        <boxGeometry args={[wellW - 0.004, 0.003, wellD - 0.004]} />
        <meshStandardMaterial color="#1a1816" roughness={0.9} />
      </mesh>

      {/* 4 inner walls — thin dark panels facing INTO the well so the
          sides of the pocket read as dark plastic rather than the
          brushed metal of the body rim. DoubleSide so they're visible
          from any viewing angle. */}
      {(() => {
        const wallThickness = 0.004;
        const wallH = wellDepth - 0.003;
        const wallY = -wellDepth / 2 + 0.0015;
        const wallMat = (
          <meshStandardMaterial
            color="#1a1816"
            roughness={0.9}
            side={THREE.DoubleSide}
          />
        );
        return (
          <>
            {/* Left inner wall */}
            <mesh position={[wellLeft + wallThickness / 2, wallY, tapeWellZ]}>
              <boxGeometry args={[wallThickness, wallH, wellD - 0.004]} />
              {wallMat}
            </mesh>
            {/* Right inner wall */}
            <mesh position={[wellRight - wallThickness / 2, wallY, tapeWellZ]}>
              <boxGeometry args={[wallThickness, wallH, wellD - 0.004]} />
              {wallMat}
            </mesh>
            {/* Back inner wall */}
            <mesh position={[tapeWellX, wallY, wellBack + wallThickness / 2]}>
              <boxGeometry args={[wellW - 0.004, wallH, wallThickness]} />
              {wallMat}
            </mesh>
            {/* Front inner wall */}
            <mesh position={[tapeWellX, wallY, wellFront - wallThickness / 2]}>
              <boxGeometry args={[wellW - 0.004, wallH, wallThickness]} />
              {wallMat}
            </mesh>
          </>
        );
      })()}

      {/* Head assembly — sits on the well floor */}
      <group position={[tapeWellX, -wellDepth + 0.015, tapeWellZ + 0.25]}>
        <mesh>
          <boxGeometry args={[0.3, 0.04, 0.08]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.04]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.2, 0.01, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
        <mesh position={[-0.2, 0.02, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
          <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Reel spindles — rise up from the well floor */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[tapeWellX + x, -wellDepth + 0.04, tapeWellZ]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
          <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Label — top-left corner of deck */}
      <group position={[speakerX, 0.005, -deckD / 2 + 0.15]}>
        <mesh>
          <boxGeometry args={[0.8, 0.05, 0.2]} />
          <meshStandardMaterial color="#3a3835" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.027, 0]}>
          <boxGeometry args={[0.7, 0.001, 0.16]} />
          <meshStandardMaterial color="#d4c5a0" roughness={0.9} />
        </mesh>
        <Text
          position={[0, 0.029, 0.01]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.055}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
          characters="TAPEMASTER"
          letterSpacing={0.08}
          fontStyle="italic"
          fontWeight="bold"
        >
          TAPEMASTER
        </Text>
        <Text
          position={[0, 0.029, -0.04]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.03}
          color="#2a1a0a"
          anchorX="center"
          anchorY="middle"
          characters="30"
          letterSpacing={0.35}
        >
          3000
        </Text>
      </group>

      {/* Volume dial — left side of cream faceplate */}
      <VolumeDial position={[-1.05, 0.01, deckD / 2 - faceplateZone / 2]} volume={volume} onVolumeChange={onVolumeChange} setOrbitEnabled={setOrbitEnabled} />

      {/* Brand label on front */}
      <mesh position={[0.9, -0.015, deckD / 2 - 0.04]}>
        <boxGeometry args={[0.4, 0.01, 0.02]} />
        <meshStandardMaterial color="#c4a44a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
