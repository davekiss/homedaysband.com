"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PAPER_W = 1.53;
const PAPER_H = 1.96;

type NotebookPaperProps = {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
};

// Reusable temp objects for per-frame math (avoid GC churn)
const _tablePos = new THREE.Vector3();
const _tableQuat = new THREE.Quaternion();
const _heldPos = new THREE.Vector3();
const _heldQuat = new THREE.Quaternion();
const _lerpPos = new THREE.Vector3();
const _lerpQuat = new THREE.Quaternion();
const _forward = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _basis = new THREE.Matrix4();

export default function NotebookPaper({
  text,
  position,
  rotation = [0, 0, 0],
}: NotebookPaperProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const { camera, gl } = useThree();

  const paperTexture = useMemo(() => {
    const w = 1024;
    const h = 1308;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Aged typewriter paper — warm ivory base
    ctx.fillStyle = "#f1e7c9";
    ctx.fillRect(0, 0, w, h);

    // Soft vignette toward the edges
    const grad = ctx.createRadialGradient(
      w / 2, h / 2, w * 0.3,
      w / 2, h / 2, w * 0.95
    );
    grad.addColorStop(0, "rgba(220, 195, 140, 0)");
    grad.addColorStop(1, "rgba(175, 135, 65, 0.22)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Paper fiber/grain — fine flecks
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.08;
      ctx.fillStyle = `rgba(120, 90, 40, ${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // A few sparse age spots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 4 + 1;
      ctx.fillStyle = `rgba(${130 + Math.random() * 50}, ${95 + Math.random() * 30}, ${55 + Math.random() * 25}, ${0.06 + Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Typewriter text
    const marginX = 95;
    const marginTop = 130;
    const fontSize = 34;
    const lineHeight = 52;
    ctx.font = `${fontSize}px 'Courier New', 'Courier', monospace`;
    ctx.textBaseline = "top";

    // Word-wrap to fit the text area. Paragraphs are separated by one
    // or more blank lines in the source text ("\n\n"), and we preserve
    // that break by emitting an empty line between their wrapped lines.
    const maxW = w - marginX * 2;
    const paragraphs = text.split(/\n\s*\n/);
    const lines: string[] = [];
    paragraphs.forEach((para, idx) => {
      if (idx > 0) lines.push("");
      const words = para.trim().split(/\s+/);
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxW && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
    });

    // Draw each line with per-character jitter and ink density variation for a
    // hand-typed typewriter look
    let y = marginTop;
    for (const line of lines) {
      // Line baseline wobble
      const lineYJitter = (Math.random() - 0.5) * 2;
      let x = marginX;
      for (const char of line) {
        const jx = (Math.random() - 0.5) * 1.8;
        const jy = (Math.random() - 0.5) * 2 + lineYJitter;
        const ink = 0.72 + Math.random() * 0.28;
        // Warm dark ink
        ctx.fillStyle = `rgba(28, 18, 10, ${ink})`;
        ctx.fillText(char, x + jx, y + jy);
        // Occasional over-strike / double-hit for the extra-dark letters
        if (Math.random() < 0.05) {
          ctx.fillStyle = `rgba(15, 10, 5, 0.5)`;
          ctx.fillText(char, x + jx + 0.5, y + jy + 0.3);
        }
        x += ctx.measureText(char).width;
      }
      y += lineHeight;
    }

    // Subtle coffee-ring stain in a corner
    const stainX = w * 0.84;
    const stainY = h * 0.08;
    const stainR = w * 0.14;
    const sg = ctx.createRadialGradient(stainX, stainY, stainR * 0.3, stainX, stainY, stainR);
    sg.addColorStop(0, "rgba(120, 70, 25, 0.03)");
    sg.addColorStop(0.85, "rgba(110, 60, 20, 0.18)");
    sg.addColorStop(1, "rgba(120, 70, 25, 0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(stainX, stainY, stainR, 0, Math.PI * 2);
    ctx.fill();

    // A subtle crease/fold line near a corner
    ctx.strokeStyle = "rgba(80, 50, 20, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.02, h * 0.9);
    ctx.lineTo(w * 0.2, h * 0.99);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [text]);

  // Fixed "resting on the table" pose:
  //   First lay the standing page flat (rotate -90° around X so +z → +y),
  //   then spin it around world-Y by rotation[1] for a casual twist.
  const tablePosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const tableQuatFixed = useMemo(() => {
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const spin = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    return spin.multiply(flat);
  }, [rotation]);

  // Initial placement — set transform directly so useFrame has a valid start
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(tablePosFixed);
    groupRef.current.quaternion.copy(tableQuatFixed);
  }, [tablePosFixed, tableQuatFixed]);

  // Hover cursor
  useEffect(() => {
    if (!hovered) return;
    gl.domElement.style.cursor = "pointer";
    return () => {
      gl.domElement.style.cursor = "auto";
    };
  }, [hovered, gl]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Advance progress toward its target (0 = on table, 1 = held in front of camera)
    const target = isPickedUp ? 1 : 0;
    const speed = 2.2;
    if (progressRef.current !== target) {
      const dir = target > progressRef.current ? 1 : -1;
      progressRef.current = Math.max(
        0,
        Math.min(1, progressRef.current + dir * Math.min(delta, 0.05) * speed)
      );
    }

    const p = progressRef.current;
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    // Table pose (fixed)
    _tablePos.copy(tablePosFixed);
    _tableQuat.copy(tableQuatFixed);

    // Held pose — slightly further out than the polaroid to fit the taller page
    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 2.1)
      .addScaledVector(_camUp, -0.05);

    // Held orientation — build a basis where the page's +z points at the camera
    _toCam.copy(camera.position).sub(_heldPos).normalize();
    _right.crossVectors(_camUp, _toCam).normalize();
    _up.crossVectors(_toCam, _right);
    _basis.makeBasis(_right, _up, _toCam);
    _heldQuat.setFromRotationMatrix(_basis);

    // Interpolate position/orientation, with a gentle parabolic lift through the arc
    _lerpPos.lerpVectors(_tablePos, _heldPos, ease);
    _lerpQuat.slerpQuaternions(_tableQuat, _heldQuat, ease);
    _lerpPos.y += 4 * ease * (1 - ease) * 0.35;

    group.position.copy(_lerpPos);
    group.quaternion.copy(_lerpQuat);

    // Ramp up emissive so the paper reads clearly against dim areas in front
    // of the camera without washing out on the table
    if (matRef.current) {
      matRef.current.emissiveIntensity = ease * 0.45;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        setIsPickedUp((v) => !v);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Paper — thin plane. Natural orientation: face +z (standing),
          so the group quaternion can animate between flat and held. */}
      <mesh castShadow receiveShadow>
        <planeGeometry args={[PAPER_W, PAPER_H]} />
        <meshStandardMaterial
          ref={matRef}
          map={paperTexture}
          emissiveMap={paperTexture}
          emissive="#f0e8d4"
          emissiveIntensity={0}
          roughness={0.95}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
