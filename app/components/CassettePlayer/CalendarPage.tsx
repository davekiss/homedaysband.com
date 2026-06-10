"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Show } from "@/data/shows";
import {
  createCalendarPageTexture,
  calendarParts,
  CALENDAR_PAGE_ASPECT,
} from "./calendarPageTexture";

const PAGE_W = 0.8;
const PAGE_H = PAGE_W * CALENDAR_PAGE_ASPECT;

type CalendarPageProps = {
  show: Show;
  position: [number, number, number];
  tilt?: number; // casual z-rotation while taped to the wall
};

// Reusable temp objects for per-frame math (avoid GC churn)
const _wallPos = new THREE.Vector3();
const _wallQuat = new THREE.Quaternion();
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

export default function CalendarPage({
  show,
  position,
  tilt = 0,
}: CalendarPageProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const pageMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const pageClickedRef = useRef(false);
  const { camera, gl } = useThree();

  const pageTexture = useMemo(() => {
    const parts = calendarParts(show.date);
    return createCalendarPageTexture({
      ...parts,
      torn: true,
      circled: true,
      scrawl: ["HOMEDAYS @", show.venue, show.location],
    });
  }, [show]);

  // Resting pose — hanging flat against the back wall, with a casual tilt
  const wallPosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const wallQuatFixed = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, tilt)),
    [tilt]
  );

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(wallPosFixed);
    groupRef.current.quaternion.copy(wallQuatFixed);
  }, [wallPosFixed, wallQuatFixed]);

  // Click-away-to-put-down — same trick as the business card: R3F's click
  // fires first and flags pageClickedRef, so a bare canvas click means the
  // user clicked the background and the page should return to the wall.
  useEffect(() => {
    if (!isPickedUp) return;
    const handler = () => {
      if (pageClickedRef.current) {
        pageClickedRef.current = false;
        return;
      }
      setIsPickedUp(false);
    };
    gl.domElement.addEventListener("click", handler);
    return () => gl.domElement.removeEventListener("click", handler);
  }, [isPickedUp, gl]);

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

    _wallPos.copy(wallPosFixed);
    _wallQuat.copy(wallQuatFixed);

    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 1.9)
      .addScaledVector(_camUp, -0.05);

    _toCam.copy(camera.position).sub(_heldPos).normalize();
    _right.crossVectors(_camUp, _toCam).normalize();
    _up.crossVectors(_toCam, _right);
    _basis.makeBasis(_right, _up, _toCam);
    _heldQuat.setFromRotationMatrix(_basis);

    _lerpPos.lerpVectors(_wallPos, _heldPos, ease);
    _lerpQuat.slerpQuaternions(_wallQuat, _heldQuat, ease);
    // Smaller arc than the table items — the page peels off a wall, it
    // doesn't get lifted off a surface
    _lerpPos.y += 4 * ease * (1 - ease) * 0.15;

    group.position.copy(_lerpPos);
    group.quaternion.copy(_lerpQuat);

    if (pageMatRef.current) {
      pageMatRef.current.emissiveIntensity = ease * 0.45;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    pageClickedRef.current = true;
    if (isPickedUp) {
      // Click while held — open tickets if the show has them, then put back
      if (show.ticketsUrl) {
        window.open(show.ticketsUrl, "_blank", "noopener,noreferrer");
      }
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
      <mesh>
        <planeGeometry args={[PAGE_W, PAGE_H]} />
        <meshStandardMaterial
          ref={pageMatRef}
          map={pageTexture}
          emissiveMap={pageTexture}
          emissive="#fff6e0"
          emissiveIntensity={0}
          alphaTest={0.5}
          roughness={0.9}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Two bits of scotch tape straddling the top corners */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (PAGE_W / 2 - 0.08), PAGE_H / 2 - 0.005, 0.003]}
          rotation={[0, 0, side * -0.28]}
        >
          <planeGeometry args={[0.18, 0.06]} />
          <meshStandardMaterial
            color="#f8f5e8"
            transparent
            opacity={0.38}
            roughness={0.3}
            metalness={0.0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
