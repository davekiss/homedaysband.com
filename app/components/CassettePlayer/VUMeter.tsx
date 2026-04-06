"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const METER_W = 0.5;
const METER_H = 0.008;
const METER_D = 0.14;
const STRIP_H = 0.04;
const GREEN_RATIO = 0.64;
const RED_START = 0.72;

export default function VUMeter({
  position,
  getFrequencyData,
  isPlaying,
}: {
  position: [number, number, number];
  getFrequencyData: () => Uint8Array;
  isPlaying: boolean;
}) {
  const needleRef = useRef<THREE.Mesh>(null);
  const levelRef = useRef(0);

  // Background texture — warm paper with green/black/red strip
  const meterTexture = useMemo(() => {
    const w = 512;
    const h = 128;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Warm paper background
    ctx.fillStyle = "#e8dcc0";
    ctx.fillRect(0, 0, w, h);

    // Paper grain noise
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Color strip — centered vertically
    const stripY = h * 0.38;
    const stripH = h * 0.24;
    const pad = w * 0.04;
    const stripW = w - pad * 2;

    // Green section (0% to 64%)
    const greenEnd = pad + stripW * GREEN_RATIO;
    const greenGrad = ctx.createLinearGradient(pad, 0, greenEnd, 0);
    greenGrad.addColorStop(0, "#4a8c3f");
    greenGrad.addColorStop(0.7, "#5a9c4a");
    greenGrad.addColorStop(1, "#4a8c3f");
    ctx.fillStyle = greenGrad;
    ctx.fillRect(pad, stripY, greenEnd - pad, stripH);

    // Worn/faded effect on green
    for (let i = 0; i < 400; i++) {
      const x = pad + Math.random() * (greenEnd - pad);
      const y = stripY + Math.random() * stripH;
      ctx.fillStyle = `rgba(232,220,192,${Math.random() * 0.15})`;
      ctx.fillRect(x, y, 2, 1);
    }

    // Black divider bar at the ideal volume mark — thicker
    const dividerX = pad + stripW * RED_START;
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(dividerX - 4, stripY - 3, 8, stripH + 6);

    // Transition zone (64% to 72%) — dark green to orange
    const transGrad = ctx.createLinearGradient(greenEnd, 0, dividerX, 0);
    transGrad.addColorStop(0, "#6a8c3f");
    transGrad.addColorStop(1, "#8a6a30");
    ctx.fillStyle = transGrad;
    ctx.fillRect(greenEnd, stripY, dividerX - greenEnd - 2, stripH);

    // Red section (72% to 100%)
    const redEnd = pad + stripW;
    const redGrad = ctx.createLinearGradient(dividerX, 0, redEnd, 0);
    redGrad.addColorStop(0, "#a83a2a");
    redGrad.addColorStop(0.5, "#c04030");
    redGrad.addColorStop(1, "#a83a2a");
    ctx.fillStyle = redGrad;
    ctx.fillRect(dividerX + 2, stripY, redEnd - dividerX - 2, stripH);

    // Worn/faded effect on red
    for (let i = 0; i < 150; i++) {
      const x = dividerX + 2 + Math.random() * (redEnd - dividerX - 2);
      const y = stripY + Math.random() * stripH;
      ctx.fillStyle = `rgba(232,220,192,${Math.random() * 0.12})`;
      ctx.fillRect(x, y, 2, 1);
    }

    // Small tick marks along the bottom of the strip
    ctx.strokeStyle = "#2a2018";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
      const x = pad + (stripW * i) / 20;
      const tickH = i % 5 === 0 ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(x, stripY + stripH + 2);
      ctx.lineTo(x, stripY + stripH + 2 + tickH);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Animate needle based on frequency data
  useFrame(() => {
    if (!needleRef.current) return;

    let target = 0;
    if (isPlaying) {
      const data = getFrequencyData();
      if (data.length > 0) {
        // Average the low-mid frequencies for a VU-like response
        let sum = 0;
        const count = Math.min(data.length, 64);
        for (let i = 0; i < count; i++) {
          sum += data[i];
        }
        target = sum / count / 255;
      }
    }

    // Smooth the level — fast attack, slow decay
    const attack = 0.3;
    const decay = 0.08;
    const rate = target > levelRef.current ? attack : decay;
    levelRef.current += (target - levelRef.current) * rate;

    // Map level to X position within the meter
    const pad = METER_W * 0.04;
    const usable = METER_W - pad * 2;
    const x = -METER_W / 2 + pad + levelRef.current * usable;
    needleRef.current.position.x = x;
  });

  const frameH = 0.025;

  return (
    <group position={position}>
      {/* Outer housing — dark plastic frame sits below the face */}
      <mesh position={[0, -frameH / 2, 0]} castShadow>
        <boxGeometry args={[METER_W + 0.03, frameH, METER_D + 0.02]} />
        <meshStandardMaterial color="#2a2826" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Meter face with paper background and color strip — on top */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[METER_W, METER_D]} />
        <meshStandardMaterial map={meterTexture} roughness={0.9} />
      </mesh>

      {/* Internal backlight — 3 faint points behind the color strip */}
      <pointLight position={[-METER_W * 0.3, -0.005, 0]} intensity={0.012} color="#f5e8c8" distance={0.1} decay={2} />
      <pointLight position={[0, -0.005, 0]} intensity={0.012} color="#f5e8c8" distance={0.1} decay={2} />
      <pointLight position={[METER_W * 0.3, -0.005, 0]} intensity={0.012} color="#f5e8c8" distance={0.1} decay={2} />

      {/* Plastic window cover — sits above the face */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[METER_W + 0.01, 0.004, METER_D + 0.005]} />
        <meshStandardMaterial
          color="#d8d0c0"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.05}
        />
      </mesh>

      {/* Red needle / indicator — hairline, anchored to bottom (front edge, +Z) */}
      <mesh
        ref={needleRef}
        position={[-METER_W / 2 + 0.03, 0.004, METER_D / 2 - METER_D * 0.4]}
      >
        <boxGeometry args={[0.003, 0.005, METER_D * 0.8]} />
        <meshStandardMaterial
          color="#cc2020"
          roughness={0.4}
          metalness={0.3}
          emissive="#cc2020"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}
