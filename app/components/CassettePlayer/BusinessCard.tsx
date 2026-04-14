"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const CARD_W = 0.65;
const CARD_H = 0.38;
const CARD_T = 0.008;

type BusinessCardProps = {
  name: string;
  title?: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
};

// Reusable temp objects for per-frame math
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

export default function BusinessCard({
  name,
  title = "3D Artist",
  url,
  position,
  rotation = [0, 0, 0],
}: BusinessCardProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const frontMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const cardClickedRef = useRef(false);
  const { camera, gl } = useThree();

  // Front face — designed like a minimal luthier/artist business card
  const frontTexture = useMemo(() => {
    const w = 650;
    const h = 380;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Off-white card stock with warm cream tone
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, w, h);

    // Subtle paper grain noise
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.04;
      ctx.fillStyle = `rgba(120,100,70,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const pad = 48;

    // ── Name — large, bold, top-left ──
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 50px Georgia, serif";
    ctx.textBaseline = "top";
    ctx.fillText(name, pad, 42);

    // ── Subtitle — italic, right below name ──
    ctx.fillStyle = "#4a4a3a";
    ctx.font = "italic 19px Georgia, serif";
    ctx.fillText("Custom Guitar 3D Models", pad, 100);

    // ── Full-width divider ──
    ctx.fillStyle = "#c8c0b0";
    ctx.fillRect(pad, 140, w - pad * 2, 1);

    // ── Description — left side below divider ──
    ctx.fillStyle = "#777766";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("Handcrafted digital instruments", pad, 164);
    ctx.fillText("for studios & interactive media", pad, 186);

    // ── Right side — six guitar strings with nut & bridge ──
    const stringsX = w - 190;
    const stringsW = 110;
    const stringsTop = 46;
    const stringsBot = h - 92;

    // Nut (top bar)
    ctx.fillStyle = "#8a8070";
    ctx.fillRect(stringsX - 6, stringsTop - 3, stringsW + 12, 5);
    // Bridge (bottom bar)
    ctx.fillRect(stringsX - 6, stringsBot - 2, stringsW + 12, 5);

    // Strings
    for (let i = 0; i < 6; i++) {
      const x = stringsX + i * (stringsW / 5);
      const thickness = 1.0 + i * 0.4; // thinner high strings, thicker low
      ctx.strokeStyle = `rgba(100,90,70,${0.4 + i * 0.08})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x, stringsTop + 3);
      ctx.lineTo(x, stringsBot - 2);
      ctx.stroke();
    }

    // ── Bottom divider — full width ──
    ctx.fillStyle = "#c8c0b0";
    ctx.fillRect(pad, h - 64, w - pad * 2, 1);

    // ── Bottom-left: tagline ──
    ctx.fillStyle = "#aaa898";
    ctx.font = "13px Georgia, serif";
    ctx.textBaseline = "top";
    ctx.fillText("3D Models & Design", pad, h - 48);

    // ── Bottom-right: URL ──
    ctx.fillStyle = "#888878";
    ctx.font = "15px Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText("sketchfab.com/KgDaniel", w - pad, h - 47);
    ctx.textAlign = "left";

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [name, title]);

  // Back face — simple, just a logo/domain
  const backTexture = useMemo(() => {
    const w = 650;
    const h = 380;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#c8c0b0";
    ctx.font = "bold 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, w / 2, h / 2 - 12);

    ctx.fillStyle = "#888078";
    ctx.font = "16px Georgia, serif";
    ctx.fillText("3D Models & Design", w / 2, h / 2 + 22);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [name]);

  // Resting pose — flat on the table
  const tablePosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const tableQuatFixed = useMemo(() => {
    const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const spin = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    return spin.multiply(flat);
  }, [rotation]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(tablePosFixed);
    groupRef.current.quaternion.copy(tableQuatFixed);
  }, [tablePosFixed, tableQuatFixed]);

  // Click-away-to-put-down: when held, clicking anywhere on the canvas
  // (outside the card mesh) sets the card back down without opening the link.
  // We listen for DOM "click" (not pointerdown) because R3F's internal click
  // handler fires first (registered earlier), setting cardClickedRef so we
  // can distinguish card clicks from background clicks.
  useEffect(() => {
    if (!isPickedUp) return;
    const handler = () => {
      if (cardClickedRef.current) {
        cardClickedRef.current = false;
        return;
      }
      setIsPickedUp(false);
    };
    gl.domElement.addEventListener("click", handler);
    return () => gl.domElement.removeEventListener("click", handler);
  }, [isPickedUp, gl]);

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

    _tablePos.copy(tablePosFixed);
    _tableQuat.copy(tableQuatFixed);

    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 1.5)
      .addScaledVector(_camUp, -0.08);

    _toCam.copy(camera.position).sub(_heldPos).normalize();
    _right.crossVectors(_camUp, _toCam).normalize();
    _up.crossVectors(_toCam, _right);
    _basis.makeBasis(_right, _up, _toCam);
    _heldQuat.setFromRotationMatrix(_basis);

    _lerpPos.lerpVectors(_tablePos, _heldPos, ease);
    _lerpQuat.slerpQuaternions(_tableQuat, _heldQuat, ease);
    _lerpPos.y += 4 * ease * (1 - ease) * 0.35;

    group.position.copy(_lerpPos);
    group.quaternion.copy(_lerpQuat);

    if (frontMatRef.current) {
      frontMatRef.current.emissiveIntensity = ease * 0.8;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    cardClickedRef.current = true;
    if (isPickedUp) {
      // Click on the card while held — open the URL
      window.open(url, "_blank", "noopener,noreferrer");
      setIsPickedUp(false);
    } else {
      setIsPickedUp(true);
    }
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CARD_W, CARD_H, CARD_T]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Front face */}
      <mesh position={[0, 0, CARD_T / 2 + 0.0005]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshStandardMaterial
          ref={frontMatRef}
          map={frontTexture}
          emissiveMap={frontTexture}
          emissive="#f0e8d4"
          emissiveIntensity={0}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Back face */}
      <mesh position={[0, 0, -CARD_T / 2 - 0.0005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshStandardMaterial
          map={backTexture}
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}
