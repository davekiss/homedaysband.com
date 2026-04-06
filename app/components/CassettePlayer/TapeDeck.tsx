"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import VolumeDial from "./VolumeDial";

// Horizontal grill slats — brown plastic with a slight sheen
function GrillSlats({
  position,
  width,
  height,
}: {
  position: [number, number, number];
  width: number;
  height: number;
}) {
  const slatCount = 28;
  const slatHeight = height / (slatCount * 1.5 + 0.5); // slat + gap ratio
  const gapHeight = slatHeight * 0.5;
  const slats = [];

  for (let i = 0; i < slatCount; i++) {
    const z =
      position[2] -
      height / 2 +
      slatHeight / 2 +
      i * (slatHeight + gapHeight);
    slats.push(
      <mesh key={i} position={[position[0], position[1], z]} castShadow>
        <boxGeometry args={[width, 0.015, slatHeight]} />
        <meshStandardMaterial
          color="#6b4a30"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
    );
  }

  return (
    <group>
      {/* Dark backing behind the slats */}
      <mesh position={[position[0], position[1] - 0.01, position[2]]}>
        <boxGeometry args={[width, 0.005, height]} />
        <meshStandardMaterial color="#1a1210" roughness={0.9} />
      </mesh>
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

  return (
    <group>
      {/* Main deck body */}
      <mesh receiveShadow position={[0, -deckH / 2, 0]}>
        <boxGeometry args={[deckW, deckH, deckD]} />
        <meshStandardMaterial
          map={brushedMetalTexture}
          color="#5a5650"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Top plate */}
      <mesh receiveShadow position={[0, 0.001, 0]}>
        <boxGeometry args={[deckW - 0.1, 0.005, deckD - 0.1]} />
        <meshStandardMaterial color="#6a665e" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* === GRILL SECTION — back 75%, full width === */}
      <GrillSlats
        position={[0, 0.005, grillCenterZ]}
        width={deckW}
        height={grillZone - 0.1}
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

      {/* === TAPE WELL — in the grill zone, right of speaker === */}
      <mesh position={[tapeWellX, 0.0, tapeWellZ]}>
        <boxGeometry args={[1.1, 0.03, 0.75]} />
        <meshStandardMaterial color="#2a2826" roughness={0.8} />
      </mesh>

      {/* Head assembly */}
      <group position={[tapeWellX, 0.01, tapeWellZ + 0.25]}>
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

      {/* Reel spindles — offset with tape well */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[tapeWellX + x, 0.02, tapeWellZ]}>
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
