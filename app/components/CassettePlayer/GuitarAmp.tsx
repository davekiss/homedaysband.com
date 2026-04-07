"use client";

import { useMemo } from "react";
import * as THREE from "three";

const AMP_W = 2.4;
const AMP_H = 1.4;
const AMP_D = 0.7;

type GuitarAmpProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

export default function GuitarAmp({ position, rotation = [0, 0, 0] }: GuitarAmpProps) {
  // Silver grille cloth — horizontal weave pattern
  const grilleTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Dark backing behind the weave
    ctx.fillStyle = "#16161a";
    ctx.fillRect(0, 0, size, size);

    // Silver weave — slightly offset rows for a woven look
    for (let y = 0; y < size; y += 4) {
      const offset = Math.floor(y / 4) % 2 === 0 ? 0 : 2;
      for (let x = offset; x < size; x += 4) {
        const b = 150 + Math.random() * 90;
        ctx.fillStyle = `rgb(${b}, ${b}, ${b})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Aging/stains
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.22})`;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 4 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Black tolex — pebbled vinyl covering
  const tolexTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#15151a";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const b = 20 + Math.random() * 55;
      ctx.fillStyle = `rgba(${b}, ${b}, ${b + 5}, 0.6)`;
      ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
    }

    // Scuffs near the bottom
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(80, 70, 60, ${Math.random() * 0.35})`;
      const x = Math.random() * size;
      const y = size * (0.7 + Math.random() * 0.3);
      ctx.fillRect(x, y, Math.random() * 6 + 1, Math.random() * 2 + 0.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Corner badge — small vintage-looking plaque
  const badgeTexture = useMemo(() => {
    const w = 256;
    const h = 128;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Black lacquer base with subtle gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#1a1612");
    grad.addColorStop(1, "#0a0806");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Gold double border
    ctx.strokeStyle = "#c8a868";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Stylized cursive flourish
    ctx.strokeStyle = "#e4c488";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(30, 80);
    ctx.quadraticCurveTo(60, 30, 90, 70);
    ctx.quadraticCurveTo(115, 95, 140, 55);
    ctx.quadraticCurveTo(170, 25, 200, 75);
    ctx.quadraticCurveTo(215, 95, 225, 80);
    ctx.stroke();

    // Underline swoosh
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 95);
    ctx.lineTo(215, 95);
    ctx.stroke();

    // Aging
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.4})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const grilleW = AMP_W * 0.85;
  const grilleH = AMP_H * 0.72;
  const grilleCenterY = -AMP_H * 0.04;
  const chassisZ = -AMP_D * 0.22;
  const chassisTop = AMP_H / 2 + 0.025;

  // Knob positions — 4 knobs: volume, treble, middle, bass
  const knobXs = [-0.54, -0.18, 0.18, 0.54];

  return (
    <group position={position} rotation={rotation}>
      {/* Main cabinet body — black tolex */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[AMP_W, AMP_H, AMP_D]} />
        <meshStandardMaterial
          map={tolexTexture}
          color="#2a2a2e"
          roughness={0.78}
          metalness={0.08}
        />
      </mesh>

      {/* Silver grille cloth — on the front face */}
      <mesh position={[0, grilleCenterY, AMP_D / 2 + 0.003]}>
        <planeGeometry args={[grilleW, grilleH]} />
        <meshStandardMaterial
          map={grilleTexture}
          roughness={0.85}
          metalness={0.35}
        />
      </mesh>

      {/* Cream piping around the grille */}
      {(() => {
        const pipe = 0.018;
        return (
          <group position={[0, grilleCenterY, AMP_D / 2 + 0.006]}>
            {/* top */}
            <mesh position={[0, grilleH / 2 + pipe / 2, 0]}>
              <boxGeometry args={[grilleW + pipe * 2, pipe, 0.012]} />
              <meshStandardMaterial color="#d8d0c0" roughness={0.55} metalness={0.1} />
            </mesh>
            {/* bottom */}
            <mesh position={[0, -grilleH / 2 - pipe / 2, 0]}>
              <boxGeometry args={[grilleW + pipe * 2, pipe, 0.012]} />
              <meshStandardMaterial color="#d8d0c0" roughness={0.55} metalness={0.1} />
            </mesh>
            {/* left */}
            <mesh position={[-grilleW / 2 - pipe / 2, 0, 0]}>
              <boxGeometry args={[pipe, grilleH, 0.012]} />
              <meshStandardMaterial color="#d8d0c0" roughness={0.55} metalness={0.1} />
            </mesh>
            {/* right */}
            <mesh position={[grilleW / 2 + pipe / 2, 0, 0]}>
              <boxGeometry args={[pipe, grilleH, 0.012]} />
              <meshStandardMaterial color="#d8d0c0" roughness={0.55} metalness={0.1} />
            </mesh>
          </group>
        );
      })()}

      {/* Corner badge — bottom right of grille */}
      <mesh
        position={[
          grilleW / 2 - 0.11,
          grilleCenterY - grilleH / 2 + 0.08,
          AMP_D / 2 + 0.008,
        ]}
      >
        <planeGeometry args={[0.18, 0.09]} />
        <meshStandardMaterial
          map={badgeTexture}
          roughness={0.35}
          metalness={0.55}
        />
      </mesh>

      {/* Chassis strip on top — dark metal panel for controls */}
      <mesh position={[0, chassisTop, chassisZ]} castShadow receiveShadow>
        <boxGeometry args={[AMP_W - 0.08, 0.03, AMP_D * 0.42]} />
        <meshStandardMaterial color="#16161a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Thin brushed-chrome trim along the front edge of chassis */}
      <mesh position={[0, chassisTop + 0.01, chassisZ + (AMP_D * 0.42) / 2 - 0.004]}>
        <boxGeometry args={[AMP_W - 0.09, 0.008, 0.008]} />
        <meshStandardMaterial color="#a8a49c" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Knobs on top — 4 control knobs */}
      {knobXs.map((x, i) => (
        <group key={i} position={[x, chassisTop + 0.015, chassisZ]}>
          {/* Knob skirt */}
          <mesh castShadow>
            <cylinderGeometry args={[0.042, 0.046, 0.012, 24]} />
            <meshStandardMaterial color="#8a867e" roughness={0.35} metalness={0.75} />
          </mesh>
          {/* Knob body */}
          <mesh position={[0, 0.022, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.038, 0.04, 24]} />
            <meshStandardMaterial color="#a8a298" roughness={0.28} metalness={0.8} />
          </mesh>
          {/* Top cap */}
          <mesh position={[0, 0.043, 0]}>
            <cylinderGeometry args={[0.033, 0.033, 0.003, 24]} />
            <meshStandardMaterial color="#bcb4a8" roughness={0.22} metalness={0.88} />
          </mesh>
          {/* Indicator line etched on top */}
          <mesh position={[0, 0.045, -0.02]}>
            <boxGeometry args={[0.004, 0.0015, 0.028]} />
            <meshStandardMaterial color="#1a1008" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Red bulbous indicator light on the right */}
      <group position={[AMP_W / 2 - 0.095, chassisTop + 0.018, chassisZ]}>
        {/* Chrome bezel */}
        <mesh>
          <cylinderGeometry args={[0.032, 0.036, 0.015, 20]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Red jewel — bulbous dome */}
        <mesh position={[0, 0.018, 0]}>
          <sphereGeometry args={[0.028, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#ff1a0a"
            emissive="#ff1505"
            emissiveIntensity={1.8}
            roughness={0.18}
            metalness={0.15}
            transparent
            opacity={0.92}
          />
        </mesh>
      </group>
      {/* Subtle red glow cast from the indicator */}
      <pointLight
        position={[
          AMP_W / 2 - 0.095,
          chassisTop + 0.12,
          chassisZ,
        ]}
        color="#ff2a10"
        intensity={0.6}
        distance={1.4}
        decay={2}
      />

      {/* Power switch on the left */}
      <group position={[-AMP_W / 2 + 0.09, chassisTop + 0.018, chassisZ]}>
        {/* Switch plate */}
        <mesh>
          <boxGeometry args={[0.045, 0.008, 0.07]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.55} metalness={0.6} />
        </mesh>
        {/* Toggle body */}
        <mesh position={[0, 0.018, 0.01]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.0085, 0.01, 0.035, 12]} />
          <meshStandardMaterial color="#353033" roughness={0.35} metalness={0.8} />
        </mesh>
        {/* Toggle tip */}
        <mesh position={[0, 0.033, 0.015]} rotation={[0.35, 0, 0]}>
          <sphereGeometry args={[0.0095, 12, 12]} />
          <meshStandardMaterial color="#48423e" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* Carry handle on top-front of cabinet */}
      <group position={[0, AMP_H / 2 + 0.012, AMP_D * 0.26]}>
        {/* Handle mount plates */}
        {[-0.26, 0.26].map((x, i) => (
          <mesh key={i} position={[x, 0.006, 0]} castShadow>
            <boxGeometry args={[0.08, 0.012, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.45} metalness={0.6} />
          </mesh>
        ))}
        {/* Handle mount screws */}
        {[
          [-0.28, -0.02],
          [-0.28, 0.02],
          [0.28, -0.02],
          [0.28, 0.02],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.013, z]}>
            <cylinderGeometry args={[0.004, 0.004, 0.003, 8]} />
            <meshStandardMaterial color="#6a6660" roughness={0.4} metalness={0.85} />
          </mesh>
        ))}
        {/* Handle strap — leather/vinyl, slight arch */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <boxGeometry args={[0.52, 0.03, 0.055]} />
          <meshStandardMaterial color="#1f1a16" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Handle stitching */}
        <mesh position={[0, 0.046, 0.02]}>
          <boxGeometry args={[0.5, 0.002, 0.002]} />
          <meshStandardMaterial color="#5a4a38" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.046, -0.02]}>
          <boxGeometry args={[0.5, 0.002, 0.002]} />
          <meshStandardMaterial color="#5a4a38" roughness={0.8} />
        </mesh>
      </group>

      {/* Metal corner protectors — L-shaped brackets wrapping the top corners */}
      {(() => {
        const bracketSize = 0.1;
        const plateThick = 0.006;
        const eps = 0.002;
        // Four top corners: [x-sign, z-sign]
        const corners: [number, number][] = [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ];
        const matProps = {
          color: "#8a8680",
          roughness: 0.4,
          metalness: 0.85,
        };
        return corners.map(([sx, sz], i) => {
          const cornerX = (sx * AMP_W) / 2;
          const cornerY = AMP_H / 2;
          const cornerZ = (sz * AMP_D) / 2;
          // Each plate is a thin square sitting flush against one of the
          // three cabinet faces that meet at this corner. Together the three
          // plates form an L-shaped metal corner protector.
          return (
            <group key={i}>
              {/* Plate on ±x side face */}
              <mesh
                position={[
                  cornerX + sx * (plateThick / 2 + eps),
                  cornerY - bracketSize / 2,
                  cornerZ - (sz * bracketSize) / 2,
                ]}
                castShadow
              >
                <boxGeometry args={[plateThick, bracketSize, bracketSize]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
              {/* Plate on top face */}
              <mesh
                position={[
                  cornerX - (sx * bracketSize) / 2,
                  cornerY + plateThick / 2 + eps,
                  cornerZ - (sz * bracketSize) / 2,
                ]}
                castShadow
              >
                <boxGeometry args={[bracketSize, plateThick, bracketSize]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
              {/* Plate on ±z face (front/back) */}
              <mesh
                position={[
                  cornerX - (sx * bracketSize) / 2,
                  cornerY - bracketSize / 2,
                  cornerZ + sz * (plateThick / 2 + eps),
                ]}
                castShadow
              >
                <boxGeometry args={[bracketSize, bracketSize, plateThick]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
            </group>
          );
        });
      })()}

      {/* Rubber feet on the bottom */}
      {[
        [-AMP_W / 2 + 0.1, -AMP_H / 2 - 0.01, -AMP_D / 2 + 0.1],
        [AMP_W / 2 - 0.1, -AMP_H / 2 - 0.01, -AMP_D / 2 + 0.1],
        [-AMP_W / 2 + 0.1, -AMP_H / 2 - 0.01, AMP_D / 2 - 0.1],
        [AMP_W / 2 - 0.1, -AMP_H / 2 - 0.01, AMP_D / 2 - 0.1],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.025, 14]} />
          <meshStandardMaterial color="#08080a" roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
