"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, RoundedBox, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import type { PlayerState } from "./useAudioPlayer";

type CassetteTapeProps = {
  isInserted: boolean;
  playerState: PlayerState;
  progress: number;
  duration: number;
  onClick?: () => void;
  label: string;
  color: string;
  position: [number, number, number];
  tableRotation?: number;
  transmissionBuffer?: THREE.Texture;
};

// Build reel hub geometry: a ring with 6 teeth around the center hole
function useReelHubGeometry(outerRadius: number, holeRadius: number) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    // Outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Center hole
    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    // Cut 6 tooth slots into the hub — rectangular notches radiating from the hole
    const toothCount = 6;
    const toothWidth = holeRadius * 0.5;
    const toothDepth = holeRadius * 0.4;
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const perpCos = Math.cos(angle + Math.PI / 2);
      const perpSin = Math.sin(angle + Math.PI / 2);

      const innerR = holeRadius * 0.35;
      const outerR = holeRadius + toothDepth;
      const hw = toothWidth / 2;

      const slot = new THREE.Path();
      slot.moveTo(
        cos * innerR - perpCos * hw,
        sin * innerR - perpSin * hw
      );
      slot.lineTo(
        cos * outerR - perpCos * hw,
        sin * outerR - perpSin * hw
      );
      slot.lineTo(
        cos * outerR + perpCos * hw,
        sin * outerR + perpSin * hw
      );
      slot.lineTo(
        cos * innerR + perpCos * hw,
        sin * innerR + perpSin * hw
      );
      slot.closePath();
      shape.holes.push(slot);
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.008,
      bevelEnabled: false,
    });
    // Center the extrusion on Z
    geo.translate(0, 0, -0.004);
    return geo;
  }, [outerRadius, holeRadius]);
}

// A single reel: small center hub + tape wound around it
function Reel({
  radius,
  hubRef,
}: {
  radius: number;
  hubRef: React.RefObject<THREE.Group | null>;
}) {
  const holeRadius = 0.012;
  const hubOuterRadius = 0.035; // Small fixed-size hub in the center
  const hubGeo = useReelHubGeometry(hubOuterRadius, holeRadius);

  return (
    <group ref={hubRef}>
      {/* Tape spool — ring of wound tape */}
      <mesh>
        <ringGeometry args={[hubOuterRadius + 0.005, radius, 48]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Hub with teeth — small center piece */}
      <mesh geometry={hubGeo}>
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

function TapeWindow({
  position,
  reelProgress,
  isPlaying,
}: {
  position: [number, number, number];
  reelProgress: number;
  isPlaying: boolean;
}) {
  const leftReelRef = useRef<THREE.Group>(null);
  const rightReelRef = useRef<THREE.Group>(null);

  const leftRadius = 0.12 - reelProgress * 0.06;
  const rightRadius = 0.06 + reelProgress * 0.06;

  useFrame((_, delta) => {
    if (!isPlaying) return;
    if (leftReelRef.current) {
      leftReelRef.current.rotation.z -= delta * (1 / Math.max(leftRadius, 0.05));
    }
    if (rightReelRef.current) {
      rightReelRef.current.rotation.z -= delta * (1 / Math.max(rightRadius, 0.05));
    }
  });

  return (
    <group position={position}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[0.72, 0.24, 0.02]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.2}
        />
      </mesh>
      {/* Window glass — frosted clear plastic */}
      <mesh position={[0, 0, 0.011]}>
        <boxGeometry args={[0.68, 0.20, 0.005]} />
        <meshPhysicalMaterial
          color="#c5dbb3"
          transparent
          opacity={0.3}
          roughness={0.15}
          metalness={0}
          clearcoat={0.4}
          clearcoatRoughness={0.3}
          ior={1.1}
          transmission={0.6}
          thickness={0.1}
        />
      </mesh>
      {/* Left reel */}
      <group position={[-0.18, 0, 0.012]}>
        <Reel radius={leftRadius} hubRef={leftReelRef} />
      </group>
      {/* Right reel */}
      <group position={[0.18, 0, 0.012]}>
        <Reel radius={rightRadius} hubRef={rightReelRef} />
      </group>
    </group>
  );
}

// Dreamy video overlay that fades in over the label when playing
// Remove <DreamyLabelOverlay /> from CassetteTape to disable
function DreamyVideoLayer({ isPlaying }: { isPlaying: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const videoTexture = useVideoTexture("/videos/clouds.mp4", {
    muted: true,
    loop: true,
    playsInline: true,
  });

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const target = isPlaying ? 0.35 : 0;
    matRef.current.opacity += (target - matRef.current.opacity) * delta * 1.5;
  });

  return (
    <mesh position={[0, 0.06, 0.0625]}>
      <planeGeometry args={[0.9, 0.45]} />
      <meshStandardMaterial
        ref={matRef}
        map={videoTexture}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        roughness={0.9}
        toneMapped={false}
        color="#8090a0"
      />
    </mesh>
  );
}

function DreamyLabelOverlay({ isPlaying }: { isPlaying: boolean }) {
  return (
    <Suspense fallback={null}>
      <DreamyVideoLayer isPlaying={isPlaying} />
    </Suspense>
  );
}

export default function CassetteTape({
  isInserted,
  playerState,
  progress,
  duration,
  onClick,
  label,
  color,
  position,
  tableRotation = 0,
  transmissionBuffer,
}: CassetteTapeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reelProgress = duration > 0 ? progress / duration : 0;
  const isPlaying = playerState === "playing" || playerState === "fast-forwarding";

  const labelTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Label background with slight texture
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 256);

    // Add noise texture to label
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Horizontal lines like real cassette labels
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    for (let y = 40; y < 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(492, y);
      ctx.stroke();
    }

    // Song title - handwritten feel
    ctx.fillStyle = "#1a1008";
    ctx.font = "italic 32px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(label, 256, 55);

    // "HOMEDAYS" branding
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillStyle = "#1a1008";
    ctx.fillText("HOMEDAYS", 256, 82);

    // Side A indicator
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillStyle = "rgba(26,16,8,0.6)";
    ctx.fillText("SIDE A", 256, 105);

    // Small decorative border
    ctx.strokeStyle = "rgba(26,16,8,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 482, 226);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [label, color]);

  // Procedural scuff/scratch roughness map for worn plastic look
  const scuffTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base roughness — medium gray
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 512, 512);

    // Random scuff patches — lighter = rougher
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 20 + Math.random() * 60;
      const h = 5 + Math.random() * 15;
      const angle = Math.random() * Math.PI;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.12})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // Fine scratches
    for (let i = 0; i < 120; i++) {
      const x0 = Math.random() * 512;
      const y0 = Math.random() * 512;
      const len = 30 + Math.random() * 80;
      const angle = Math.random() * Math.PI;
      ctx.strokeStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.cos(angle) * len, y0 + Math.sin(angle) * len);
      ctx.stroke();
    }

    // Subtle fingerprint smudges — soft circles
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 15 + Math.random() * 30;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(200,200,200,${0.06 + Math.random() * 0.08})`);
      grad.addColorStop(1, "rgba(200,200,200,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Noise grain
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const v = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.04})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Animation state: tracks progress 0→1 for insert, 1→0 for eject
  const animRef = useRef({
    progress: isInserted ? 1 : 0,
    startPos: [...position] as [number, number, number],
    startRotZ: tableRotation,
  });

  // Set position/rotation once on mount
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.set(-Math.PI / 2, 0, tableRotation);
  }, []);

  // Capture starting position when insertion state changes
  const prevInserted = useRef(isInserted);
  useEffect(() => {
    if (isInserted !== prevInserted.current && groupRef.current) {
      animRef.current.startPos = [
        groupRef.current.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z,
      ];
      animRef.current.startRotZ = groupRef.current.rotation.z;
      animRef.current.progress = 0;
      prevInserted.current = isInserted;
    }
  }, [isInserted]);

  const deckPos: [number, number, number] = [0.70, 0.05, -0.2];
  const arcHeight = 1.2; // How high the tape lifts over the deck

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const anim = animRef.current;

    // Advance progress toward 1
    if (anim.progress < 1) {
      anim.progress = Math.min(1, anim.progress + delta * 1.2);
    }

    // Ease-in-out curve
    const p = anim.progress;
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    const endPos = isInserted ? deckPos : [position[0], position[1], position[2]];
    const endRotZ = isInserted ? 0 : tableRotation;

    // Interpolate X and Z linearly with easing
    groupRef.current.position.x = anim.startPos[0] + (endPos[0] - anim.startPos[0]) * ease;
    groupRef.current.position.z = anim.startPos[2] + (endPos[2] - anim.startPos[2]) * ease;

    // Y follows the same path but with a parabolic arc added on top
    const baseY = anim.startPos[1] + (endPos[1] - anim.startPos[1]) * ease;
    const arc = 4 * ease * (1 - ease) * arcHeight; // Peaks at midpoint
    groupRef.current.position.y = baseY + arc;

    // Rotation eases smoothly
    groupRef.current.rotation.z = anim.startRotZ + (endRotZ - anim.startRotZ) * ease;
  });

  return (
    <group
      ref={groupRef}
      onClick={onClick}
    >
      {/* Main cassette body — translucent plastic shell with rounded corners */}
      <RoundedBox args={[1.1, 0.7, 0.12]} radius={0.02} smoothness={4} castShadow>
        <MeshTransmissionMaterial
          buffer={transmissionBuffer}
          backside
          samples={6}
          resolution={512}
          transmission={0.92}
          roughness={0.55}
          roughnessMap={scuffTexture}
          thickness={0.8}
          ior={1.1}
          chromaticAberration={0.01}
          anisotropy={0}
          clearcoat={0.15}
          clearcoatRoughness={0.5}
          attenuationDistance={1.5}
          attenuationColor="#2a2a28"
          color="#4a4a46"
          background={new THREE.Color("#1a1816")}
        />
      </RoundedBox>

      {/* Label sticker on front face (+Z) */}
      <mesh position={[0, 0.06, 0.062]}>
        <planeGeometry args={[0.9, 0.45]} />
        <meshStandardMaterial map={labelTexture} roughness={0.85} />
      </mesh>

      {/* Dreamy video overlay on label — remove this line to disable */}
      <DreamyLabelOverlay isPlaying={isPlaying} />

      {/* Tape window (visible reels) */}
      <TapeWindow
        position={[0, 0, 0.062]}
        reelProgress={reelProgress}
        isPlaying={isPlaying}
      />

      {/* Screw holes — flat circles on front face */}
      {[
        [-0.45, 0.27],
        [0.45, 0.27],
        [-0.45, -0.27],
        [0.45, -0.27],
        [0, -0.27],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Bottom tape opening — recessed cutout where tape is exposed */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.85, 0.1, 0.08]} />
        <meshStandardMaterial color="#0a0808" roughness={0.95} />
      </mesh>
      {/* Tape visible inside the recess */}
      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[0.8, 0.06, 0.03]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.9} />
      </mesh>
    </group>
  );
}
