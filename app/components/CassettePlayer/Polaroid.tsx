"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const FRAME_W = 0.78;
const FRAME_H = 0.75;
const FRAME_T = 0.01;
const BORDER = 0.06;
const BOTTOM_BORDER = 0.19;
const PHOTO_W = FRAME_W - BORDER * 2;
const PHOTO_H = FRAME_H - BORDER - BOTTOM_BORDER;

type PolaroidProps = {
  photoUrl: string;
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

export default function Polaroid({ photoUrl, position, rotation = [0, 0, 0] }: PolaroidProps) {
  const photoTexture = useTexture(photoUrl);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const photoMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const frameMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const { camera, gl } = useThree();

  // Aged cream frame texture with yellowing, age spots, and a subtle stain
  const frameTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Polaroid white base — warm ivory, not brown
    ctx.fillStyle = "#faf4e3";
    ctx.fillRect(0, 0, size, size);

    // Very subtle yellowing toward the edges — kept pale so the border still reads as white
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, size * 0.3,
      size / 2, size / 2, size * 0.9
    );
    grad.addColorStop(0, "rgba(240, 225, 185, 0)");
    grad.addColorStop(1, "rgba(210, 180, 120, 0.18)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // A very small amount of subtle foxing — kept sparse and faint
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 3 + 1;
      ctx.fillStyle = `rgba(${130 + Math.random() * 50}, ${95 + Math.random() * 30}, ${55 + Math.random() * 25}, ${0.04 + Math.random() * 0.08})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft coffee-ring stain in one corner
    const stainX = size * 0.78;
    const stainY = size * 0.2;
    const stainR = size * 0.16;
    const stainGrad = ctx.createRadialGradient(stainX, stainY, stainR * 0.3, stainX, stainY, stainR);
    stainGrad.addColorStop(0, "rgba(120, 65, 25, 0.02)");
    stainGrad.addColorStop(0.85, "rgba(110, 60, 20, 0.18)");
    stainGrad.addColorStop(1, "rgba(120, 65, 25, 0)");
    ctx.fillStyle = stainGrad;
    ctx.beginPath();
    ctx.arc(stainX, stainY, stainR, 0, Math.PI * 2);
    ctx.fill();

    // A slight crease/fold line across one corner
    ctx.strokeStyle = "rgba(100, 70, 30, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size * 0.02, size * 0.9);
    ctx.lineTo(size * 0.18, size * 0.98);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Fixed "resting on the table" pose:
  //   First lay the standing card flat (rotate -90° around X so +z → +y),
  //   then spin it around world-Y by rotation[1] for a casual twist.
  const tablePosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const tableQuatFixed = useMemo(() => {
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const spin = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    // Result applied to vector v: spin * flat * v
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

    // Held pose — 1.1 units in front of the camera, slightly below center
    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 1.5)
      .addScaledVector(_camUp, -0.08);

    // Held orientation — build a basis where the card's +z points at the camera
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

    // Ramp up emissive on both the photo and the frame so they read clearly
    // against dim areas in front of the camera without washing out on the table
    if (photoMatRef.current) {
      photoMatRef.current.emissiveIntensity = ease * 1.1;
    }
    if (frameMatRef.current) {
      frameMatRef.current.emissiveIntensity = ease * 0.3;
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
      {/* Polaroid card — thin cream rectangle, face +z, thick border at -y */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[FRAME_W, FRAME_H, FRAME_T]} />
        <meshStandardMaterial
          ref={frameMatRef}
          map={frameTexture}
          emissiveMap={frameTexture}
          emissive="#f0e8d4"
          emissiveIntensity={0}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* Photo on the front face, offset up (+y) so the thick border is at the bottom */}
      <mesh
        position={[0, (BOTTOM_BORDER - BORDER) / 2, FRAME_T / 2 + 0.0008]}
      >
        <planeGeometry args={[PHOTO_W, PHOTO_H]} />
        <meshStandardMaterial
          ref={photoMatRef}
          map={photoTexture}
          color="#d4b88c"
          emissiveMap={photoTexture}
          emissive="#ffe0b4"
          emissiveIntensity={0}
          roughness={0.75}
          metalness={0.0}
          toneMapped
        />
      </mesh>
    </group>
  );
}
