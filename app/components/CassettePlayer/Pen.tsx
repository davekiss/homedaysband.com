"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BODY_LENGTH = 0.62;
const BODY_RADIUS = 0.025;
const TIP_LENGTH = 0.055;
const CLICKER_LENGTH = 0.06;

type PenProps = {
  position: [number, number, number];
  rotation?: [number, number, number]; // Y component used as a casual table-spin
};

// Reusable temp objects so we don't churn the GC each frame
const _tablePos = new THREE.Vector3();
const _tableQuat = new THREE.Quaternion();
const _heldPos = new THREE.Vector3();
const _heldQuat = new THREE.Quaternion();
const _lerpPos = new THREE.Vector3();
const _lerpQuat = new THREE.Quaternion();
const _camForward = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _camBack = new THREE.Vector3();
const _basisX = new THREE.Vector3();
const _basisY = new THREE.Vector3();
const _basisZ = new THREE.Vector3();
const _basisMat = new THREE.Matrix4();

export default function Pen({ position, rotation = [0, 0, 0] }: PenProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const { camera, gl } = useThree();

  // Procedural cylinder texture — white body with faux bank branding wrapped
  // around one side. Cylinder UVs are: U = circumference (0..1 wraps once),
  // V = length (top→bottom). The canvas is tall and narrow so the V axis has
  // enough room to draw the bank text along the body's length.
  const bodyTexture = useMemo(() => {
    const W = 512; // circumference (U)
    const H = 1024; // length (V)
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // White plastic base, very faintly warmed up
    ctx.fillStyle = "#f5f1e8";
    ctx.fillRect(0, 0, W, H);

    // Thin colored band near the clicker end (top)
    ctx.fillStyle = "#1a3a72";
    ctx.fillRect(0, H * 0.18, W, H * 0.012);
    ctx.fillStyle = "#e85a1a";
    ctx.fillRect(0, H * 0.195, W, H * 0.005);

    // Bank branding text — drawn rotated so it runs along the pen's length.
    // We constrain it to roughly the U-center so it only shows on one side
    // of the cylinder.
    const drawSideText = (text: string, vCenter: number, fontSize: number) => {
      ctx.save();
      ctx.translate(W / 2, vCenter);
      // Rotate so the baseline runs along V (the length of the pen)
      ctx.rotate(-Math.PI / 2);
      ctx.font = `bold ${fontSize}px 'Helvetica Neue', Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#1a3a72";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };

    // Main mark
    drawSideText("FIRST NATIONAL BANK", H * 0.5, 44);
    // Tagline beneath, smaller
    ctx.save();
    ctx.translate(W / 2 + 38, H * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.font = `300 22px 'Helvetica Neue', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(26, 58, 114, 0.85)";
    ctx.fillText("est. 1923 · member fdic", 0, 0);
    ctx.restore();

    // Subtle wear / scuffs across the surface
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const a = Math.random() * 0.05;
      ctx.fillStyle = `rgba(60, 50, 30, ${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Table pose — pen lying flat, length along world X, branding-side facing
  // up. Built as a basis change: inner +Y (cylinder length) → world +X,
  // inner +Z (clip / branded side) → world +Y, inner +X → world +Z.
  // Then a casual Y-axis spin from the rotation prop.
  const tablePosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const tableQuatFixed = useMemo(() => {
    const base = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, 0, 1), // X column → image of inner +X
        new THREE.Vector3(1, 0, 0), // Y column → image of inner +Y
        new THREE.Vector3(0, 1, 0)  // Z column → image of inner +Z
      )
    );
    const spin = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    return spin.multiply(base);
  }, [rotation]);

  // Initial placement — set transform directly so useFrame has a valid start
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(tablePosFixed);
    groupRef.current.quaternion.copy(tableQuatFixed);
  }, [tablePosFixed, tableQuatFixed]);

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

    // Held pose — close to the camera, slight downward offset so it sits
    // around chest height in view.
    _camForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    _camBack.set(0, 0, 1).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_camForward, 0.85)
      .addScaledVector(_camUp, -0.04);

    // Held orientation — pen length runs across the screen (cam-right),
    // the bank branding (+X side) faces the camera, and the clip (+Z side)
    // sits on top of the pen so it doesn't block the text.
    //   inner +X → +cam-back (toward viewer — branding)
    //   inner +Y → +cam-right (length horizontal)
    //   inner +Z → +cam-up   (clip on top)
    _basisX.copy(_camBack);
    _basisY.copy(_camRight);
    _basisZ.copy(_camUp);
    _basisMat.makeBasis(_basisX, _basisY, _basisZ);
    _heldQuat.setFromRotationMatrix(_basisMat);

    _lerpPos.lerpVectors(_tablePos, _heldPos, ease);
    _lerpQuat.slerpQuaternions(_tableQuat, _heldQuat, ease);
    // Gentle parabolic lift through the arc, same feel as the post-it / paper
    _lerpPos.y += 4 * ease * (1 - ease) * 0.35;

    group.position.copy(_lerpPos);
    group.quaternion.copy(_lerpQuat);
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
      {/* Pen geometry built in natural orientation:
          length along local +Y, clip on local +Z, branding on local +X. */}

      {/* Main white plastic body. Three.js' CylinderGeometry has its UV
          seam (U=0) at the +Z side, so U=0.5 (where the bank text is
          centered in the canvas) sits at -Z by default. Rotating the body
          -π/2 around its own Y axis maps -Z → +X, so the bank text ends
          up on the local +X side — exactly where the held pose maps to
          cam-back, and 90° away from the clip on +Z. */}
      <mesh castShadow receiveShadow rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, BODY_LENGTH, 24]} />
        <meshStandardMaterial
          map={bodyTexture}
          color="#ffffff"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Metal tip cone — silver. Flipped so the apex (point) faces away
          from the body and the base (wide end) meets the body. */}
      <mesh
        position={[0, -BODY_LENGTH / 2 - TIP_LENGTH / 2, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      >
        <coneGeometry args={[BODY_RADIUS * 0.95, TIP_LENGTH, 20]} />
        <meshStandardMaterial color="#a8a39e" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Tiny ball point — pushed deep into the cone tip so only a sliver
          of the bead peeks out at the apex. */}
      <mesh
        position={[0, -BODY_LENGTH / 2 - TIP_LENGTH + 0.0018, 0]}
        castShadow
      >
        <sphereGeometry args={[0.0018, 14, 14]} />
        <meshStandardMaterial color="#1a1612" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Small step where the metal tip mounts to the body */}
      <mesh position={[0, -BODY_LENGTH / 2 + 0.005, 0]}>
        <cylinderGeometry args={[BODY_RADIUS * 1.04, BODY_RADIUS * 1.04, 0.012, 24]} />
        <meshStandardMaterial color="#dfdad0" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Orange clicker button on the top end */}
      <mesh
        position={[0, BODY_LENGTH / 2 + CLICKER_LENGTH / 2, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[BODY_RADIUS * 0.85, BODY_RADIUS * 0.95, CLICKER_LENGTH, 20]}
        />
        <meshStandardMaterial color="#e85a1a" roughness={0.45} metalness={0.05} />
      </mesh>
      {/* Tiny rounded cap on the clicker */}
      <mesh
        position={[0, BODY_LENGTH / 2 + CLICKER_LENGTH + 0.004, 0]}
        castShadow
      >
        <sphereGeometry args={[BODY_RADIUS * 0.85, 16, 12]} />
        <meshStandardMaterial color="#e85a1a" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Pocket clip — thin strip standing slightly off the body, with
          a small "foot" near the top where it attaches. Sits on the +Z
          side of the cylinder so it lines up with the bank text. */}
      <group position={[0, BODY_LENGTH / 2 - 0.075, BODY_RADIUS + 0.006]}>
        {/* The long strip */}
        <mesh castShadow>
          <boxGeometry args={[0.014, 0.16, 0.006]} />
          <meshStandardMaterial color="#f4f1ec" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Mounting bridge connecting the clip to the body */}
        <mesh position={[0, 0.07, -0.004]}>
          <boxGeometry args={[0.018, 0.018, 0.014]} />
          <meshStandardMaterial color="#f4f1ec" roughness={0.4} metalness={0.05} />
        </mesh>
      </group>
    </group>
  );
}
