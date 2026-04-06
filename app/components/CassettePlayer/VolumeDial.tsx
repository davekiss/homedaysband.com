"use client";

import { useRef, useMemo, useCallback, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const KNOB_RADIUS = 0.1;
const KNOB_HEIGHT = 0.055;
const KNURL_COUNT = 36;
const KNURL_WIDTH = 0.006;
const KNURL_DEPTH = 0.01;
const LABEL_RADIUS = 0.17;

// 0 at 7 o'clock (210° CW from 12), 12 at 5 o'clock (150° CW from 12)
// Sweep: 300° clockwise from 210° through 360° to 150°
function volumeToAngle(vol: number) {
  return ((210 + (vol / 12) * 300) * Math.PI) / 180;
}

export default function VolumeDial({
  position,
  volume = 7,
  onVolumeChange,
  setOrbitEnabled,
}: {
  position: [number, number, number];
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  setOrbitEnabled?: (enabled: boolean) => void;
}) {
  const knobAngle = volumeToAngle(volume);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dragStartRef = useRef<{ x: number; startVol: number } | null>(null);
  const { gl } = useThree();

  const handlePointerDown = useCallback(
    (e: THREE.Event & { stopPropagation: () => void; clientX?: number; point?: THREE.Vector3 }) => {
      e.stopPropagation();
      setDragging(true);
      setOrbitEnabled?.(false);
      // Use clientX from the native event for consistent horizontal tracking
      const nativeEvent = (e as unknown as { nativeEvent?: PointerEvent }).nativeEvent;
      const clientX = nativeEvent?.clientX ?? 0;
      dragStartRef.current = { x: clientX, startVol: volume };
      gl.domElement.style.cursor = "grabbing";

      const onMove = (me: PointerEvent) => {
        if (!dragStartRef.current) return;
        const dx = me.clientX - dragStartRef.current.x;
        // 200px of horizontal drag = full 0-12 range
        const delta = (dx / 200) * 12;
        const newVol = Math.round(Math.max(0, Math.min(12, dragStartRef.current.startVol + delta)));
        onVolumeChange?.(newVol);
      };

      const onUp = () => {
        setDragging(false);
        setOrbitEnabled?.(true);
        dragStartRef.current = null;
        gl.domElement.style.cursor = hovered ? "grab" : "pointer";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [volume, onVolumeChange, gl, hovered, setOrbitEnabled]
  );

  // Scroll wheel support
  const handleWheel = useCallback(
    (e: THREE.Event & { stopPropagation: () => void }) => {
      e.stopPropagation();
      const nativeEvent = (e as unknown as { nativeEvent?: WheelEvent }).nativeEvent;
      if (!nativeEvent) return;
      const delta = nativeEvent.deltaY > 0 ? -1 : 1;
      const newVol = Math.max(0, Math.min(12, volume + delta));
      onVolumeChange?.(newVol);
    },
    [volume, onVolumeChange]
  );

  // Dial face texture — numbers for evens, dots for odds, tick marks
  const dialTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const labelR = size * 0.36;

    ctx.fillStyle = "#2a2018";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 12; i++) {
      const angleCW = ((210 + (i / 12) * 300) * Math.PI) / 180;
      const lx = cx + labelR * Math.sin(angleCW);
      const ly = cy - labelR * Math.cos(angleCW);

      if (i % 2 === 0) {
        ctx.font = "bold 36px 'Courier New', monospace";
        ctx.fillText(String(i), lx, ly);
      } else {
        ctx.beginPath();
        ctx.arc(lx, ly, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Knurling ridge positions
  const knurls = useMemo(() => {
    const items = [];
    for (let i = 0; i < KNURL_COUNT; i++) {
      const angle = (i / KNURL_COUNT) * Math.PI * 2;
      items.push({
        x: Math.sin(angle) * (KNOB_RADIUS + KNURL_DEPTH / 2 - 0.001),
        z: Math.cos(angle) * (KNOB_RADIUS + KNURL_DEPTH / 2 - 0.001),
        rotY: angle,
      });
    }
    return items;
  }, []);

  return (
    <group position={position}>
      {/* Dial face with markings — flat on the faceplate */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LABEL_RADIUS * 2.5, LABEL_RADIUS * 2.5]} />
        <meshStandardMaterial
          map={dialTexture}
          transparent
          roughness={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Knob body — polished worn steel */}
      <group rotation={[0, -knobAngle, 0]}>
        <mesh
          position={[0, KNOB_HEIGHT / 2, 0]}
          castShadow
          onPointerDown={handlePointerDown}
          onWheel={handleWheel}
          onPointerOver={() => {
            setHovered(true);
            if (!dragging) gl.domElement.style.cursor = "grab";
          }}
          onPointerOut={() => {
            setHovered(false);
            if (!dragging) gl.domElement.style.cursor = "pointer";
          }}
        >
          <cylinderGeometry args={[KNOB_RADIUS, KNOB_RADIUS * 1.02, KNOB_HEIGHT, 32]} />
          <meshStandardMaterial
            color={hovered || dragging ? "#b0aaa4" : "#a09a94"}
            roughness={0.3}
            metalness={0.75}
          />
        </mesh>

        {/* Top cap — slightly darker, flat */}
        <mesh position={[0, KNOB_HEIGHT + 0.001, 0]}>
          <cylinderGeometry args={[KNOB_RADIUS - 0.005, KNOB_RADIUS - 0.005, 0.003, 32]} />
          <meshStandardMaterial
            color="#908a84"
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>

        {/* Indicator line — engraved groove on top */}
        <mesh position={[0, KNOB_HEIGHT + 0.003, -KNOB_RADIUS * 0.45]}>
          <boxGeometry args={[0.006, 0.002, KNOB_RADIUS * 0.65]} />
          <meshStandardMaterial color="#1a1008" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Knurled grip ridges around the edge */}
        {knurls.map((k, i) => (
          <mesh
            key={i}
            position={[k.x, KNOB_HEIGHT / 2, k.z]}
            rotation={[0, k.rotY, 0]}
            castShadow
          >
            <boxGeometry args={[KNURL_WIDTH, KNOB_HEIGHT * 0.8, KNURL_DEPTH]} />
            <meshStandardMaterial
              color="#8a8580"
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
