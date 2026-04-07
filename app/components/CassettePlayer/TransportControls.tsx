"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlayerState } from "./useAudioPlayer";

const BUTTON_W = 0.2;
const BUTTON_D = 0.3;
const BUTTON_H = 0.05;
const GAP = 0.005;
const INDENT_RADIUS = 0.065;
const INDENT_DEPTH = 0.012;
const INDENT_Z_OFFSET = 0.06;
const ROCK_ANGLE = 0.08;

// Add wear/fade to make icons look stamped and used
function addWear(ctx: CanvasRenderingContext2D, s: number) {
  // Erode edges — random transparent spots to simulate paint wearing off
  const imageData = ctx.getImageData(0, 0, s, s);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      // Randomly reduce opacity across the icon
      const fade = 0.55 + Math.random() * 0.45;
      data[i + 3] = Math.floor(data[i + 3] * fade);

      // Knock out random pixels entirely for a worn look
      if (Math.random() < 0.08) {
        data[i + 3] = 0;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// Generate a canvas texture from a drawing function
function useIconTexture(draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  return useMemo(() => {
    const s = 128;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, s, s);
    draw(ctx, s);
    addWear(ctx, s);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function drawPlay(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  ctx.beginPath();
  ctx.moveTo(s * 0.3, s * 0.15);
  ctx.lineTo(s * 0.3, s * 0.85);
  ctx.lineTo(s * 0.8, s * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawPause(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  ctx.fillRect(s * 0.2, s * 0.15, s * 0.2, s * 0.7);
  ctx.fillRect(s * 0.6, s * 0.15, s * 0.2, s * 0.7);
}

function drawStop(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  ctx.fillRect(s * 0.22, s * 0.22, s * 0.56, s * 0.56);
}

function drawRewind(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  // Left triangle
  ctx.beginPath();
  ctx.moveTo(s * 0.45, s * 0.15);
  ctx.lineTo(s * 0.45, s * 0.85);
  ctx.lineTo(s * 0.1, s * 0.5);
  ctx.closePath();
  ctx.fill();
  // Right triangle
  ctx.beginPath();
  ctx.moveTo(s * 0.85, s * 0.15);
  ctx.lineTo(s * 0.85, s * 0.85);
  ctx.lineTo(s * 0.5, s * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawFF(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  // Left triangle
  ctx.beginPath();
  ctx.moveTo(s * 0.15, s * 0.15);
  ctx.lineTo(s * 0.15, s * 0.85);
  ctx.lineTo(s * 0.5, s * 0.5);
  ctx.closePath();
  ctx.fill();
  // Right triangle
  ctx.beginPath();
  ctx.moveTo(s * 0.55, s * 0.15);
  ctx.lineTo(s * 0.55, s * 0.85);
  ctx.lineTo(s * 0.9, s * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawEject(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = "#d8d0c4";
  // Triangle pointing up
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.12);
  ctx.lineTo(s * 0.15, s * 0.58);
  ctx.lineTo(s * 0.85, s * 0.58);
  ctx.closePath();
  ctx.fill();
  // Bar underneath
  ctx.fillRect(s * 0.15, s * 0.68, s * 0.7, s * 0.15);
}

// Shared click-sound audio element. One instance is reused across all
// transport buttons (and tape clicks) so rapid-fire presses just
// restart the sample. Exported so clicking a tape can also play the
// same click that the transport buttons play.
let clickAudio: HTMLAudioElement | null = null;
export function playClickSound() {
  if (typeof window === "undefined") return;
  if (!clickAudio) {
    clickAudio = new Audio("/music/click.wav");
    clickAudio.volume = 0.7;
  }
  clickAudio.currentTime = 0;
  clickAudio.play().catch(() => {});
}

type ButtonProps = {
  position: [number, number, number];
  onClick: () => void;
  isActive?: boolean;
  iconTexture: THREE.Texture;
};

function RockerButton({ position, onClick, isActive, iconTexture }: ButtonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const targetRot = pressed || isActive ? ROCK_ANGLE : 0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const lerp = 1 - Math.pow(0.00001, delta);
    groupRef.current.rotation.x += (targetRot - groupRef.current.rotation.x) * lerp;
  });

  return (
    <group position={position}>
      <group ref={groupRef} position={[0, 0, -BUTTON_D / 2]}>
        <group position={[0, BUTTON_H / 2, BUTTON_D / 2]}>
          {/* Main button body */}
          <mesh
            castShadow
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onClick();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setPressed(true);
            }}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => {
              setPressed(false);
              setHovered(false);
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <boxGeometry args={[BUTTON_W, BUTTON_H, BUTTON_D]} />
            <meshStandardMaterial
              color={hovered ? "#b0ada8" : "#9a9590"}
              roughness={0.4}
              metalness={0.65}
            />
          </mesh>

          {/* Circular finger indent */}
          <mesh position={[0, BUTTON_H / 2 - INDENT_DEPTH / 2 + 0.001, INDENT_Z_OFFSET]}>
            <cylinderGeometry args={[INDENT_RADIUS, INDENT_RADIUS, INDENT_DEPTH, 24]} />
            <meshStandardMaterial
              color={hovered ? "#706c68" : "#5a5650"}
              roughness={0.7}
              metalness={0.4}
            />
          </mesh>

          {/* Icon plane sitting just above the indent's top face — avoids the
              z-fighting the Decal had when zoomed in */}
          <mesh
            position={[0, BUTTON_H / 2 + 0.003, INDENT_Z_OFFSET]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[INDENT_RADIUS * 1.6, INDENT_RADIUS * 1.6]} />
            <meshStandardMaterial
              map={iconTexture}
              map-anisotropy={16}
              transparent
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

type TransportControlsProps = {
  playerState: PlayerState;
  hasTrack: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onEject: () => void;
  onStopFastAction: () => void;
};

export default function TransportControls({
  playerState,
  hasTrack,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onEject,
  onStopFastAction,
}: TransportControlsProps) {
  const isPlaying = playerState === "playing";
  const spacing = BUTTON_W + GAP;
  const totalW = spacing * 4 + BUTTON_W;
  const baseX = -totalW / 2 + BUTTON_W / 2;

  const playTex = useIconTexture(drawPlay);
  const pauseTex = useIconTexture(drawPause);
  const stopTex = useIconTexture(drawStop);
  const rewindTex = useIconTexture(drawRewind);
  const ffTex = useIconTexture(drawFF);
  const ejectTex = useIconTexture(drawEject);

  return (
    <group position={[0.70, 0.01, 0.6]}>
      <RockerButton
        position={[baseX, 0, 0]}
        onClick={() => {
          if (!hasTrack) return;
          if (playerState === "rewinding") onStopFastAction();
          else onRewind();
        }}
        isActive={playerState === "rewinding"}
        iconTexture={rewindTex}
      />

      <RockerButton
        position={[baseX + spacing, 0, 0]}
        onClick={() => {
          if (!hasTrack) return;
          if (isPlaying) onPause();
          else onPlay();
        }}
        isActive={isPlaying}
        iconTexture={isPlaying ? pauseTex : playTex}
      />

      <RockerButton
        position={[baseX + spacing * 2, 0, 0]}
        onClick={() => {
          if (!hasTrack) return;
          if (playerState === "fast-forwarding") onStopFastAction();
          else onFastForward();
        }}
        isActive={playerState === "fast-forwarding"}
        iconTexture={ffTex}
      />

      <RockerButton
        position={[baseX + spacing * 3, 0, 0]}
        onClick={() => {
          if (!hasTrack) return;
          onStop();
        }}
        iconTexture={stopTex}
      />

      <RockerButton
        position={[baseX + spacing * 4, 0, 0]}
        onClick={onEject}
        iconTexture={ejectTex}
      />
    </group>
  );
}
