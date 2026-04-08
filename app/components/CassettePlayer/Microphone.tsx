"use client";

// Shure SM58-style stage microphone — self-contained. To remove,
// delete the <Microphone /> line and its import in Scene.tsx along
// with this file.
//
// The mic is built "lying flat": its long axis runs along +Z so it
// can sit horizontally on the floor as-is. Caller just needs to set
// Y = floor + HANDLE_R, and can spin it around Y for direction.

import { useMemo } from "react";
import * as THREE from "three";

type MicrophoneProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

// Dimensions roughly proportional to a real SM58 (scaled for the
// scene — tiny bit larger than true scale so it reads clearly).
const HEAD_R = 0.065;
const HANDLE_R = 0.032;
const XLR_R = 0.037;

export default function Microphone({
  position,
  rotation = [0, 0, 0],
}: MicrophoneProps) {
  // Procedural grille texture — chrome base with a hex-offset grid of
  // small dark perforations, mimicking the woven wire mesh of a real
  // SM58 basket. Also serves as a roughness/bump hint so the dots
  // catch light slightly differently than the surrounding metal.
  const grilleTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Bright silver chrome base
    ctx.fillStyle = "#c8ccd0";
    ctx.fillRect(0, 0, size, size);
    // Subtle vertical shading so the mesh has a little tonal variation
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "rgba(255,255,255,0.12)");
    grad.addColorStop(0.5, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    // Dark mesh perforations in an offset (hex-ish) grid
    const spacing = 11;
    const dotR = 2.6;
    ctx.fillStyle = "#0a0a0c";
    for (let row = 0; row * spacing < size + spacing; row++) {
      const y = row * spacing;
      const xOffset = row % 2 === 0 ? 0 : spacing / 2;
      for (let col = 0; col * spacing < size + spacing; col++) {
        const x = col * spacing + xOffset;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Tiny highlight on each dot's upper edge to fake the 3D rim of
    // the wire between perforations
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let row = 0; row * spacing < size + spacing; row++) {
      const y = row * spacing;
      const xOffset = row % 2 === 0 ? 0 : spacing / 2;
      for (let col = 0; col * spacing < size + spacing; col++) {
        const x = col * spacing + xOffset;
        ctx.beginPath();
        ctx.arc(x - 0.6, y - 0.8, dotR * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    tex.anisotropy = 8;
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation} scale={1.5}>
      {/* Ball grille — chrome wire mesh basket. Bright silver base with
          a procedural dot-grid texture that reads as the woven
          perforations of a real SM58 head when seen from the camera. */}
      <mesh position={[0, 0, 0.2]} castShadow receiveShadow>
        <sphereGeometry args={[HEAD_R, 32, 24]} />
        <meshStandardMaterial
          map={grilleTexture}
          color="#e4e8ec"
          roughness={0.72}
          metalness={0.55}
        />
      </mesh>

      {/* Chrome trim ring where the basket meets the neck — a thin
          brighter band that sells the metallic grille boundary */}
      <mesh position={[0, 0, 0.15]} castShadow>
        <torusGeometry args={[HEAD_R * 0.88, 0.005, 10, 28]} />
        <meshStandardMaterial
          color="#d0d4d8"
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* Neck — short matte black taper between ball and handle.
          Rotated so cylinder's Y axis aligns with +Z; args order is
          [radiusTop, radiusBottom, height, segments]; after rotation
          the "top" radius is the ball-facing side (+Z). */}
      <mesh position={[0, 0, 0.115]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry
          args={[HEAD_R * 0.86, HANDLE_R * 1.15, 0.06, 28]}
        />
        <meshStandardMaterial color="#141416" roughness={0.6} metalness={0.25} />
      </mesh>

      {/* Handle body — main matte black cylinder */}
      <mesh
        position={[0, 0, -0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[HANDLE_R, HANDLE_R, 0.22, 32]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.55} metalness={0.3} />
      </mesh>

      {/* XLR connector collar — chrome sleeve at the butt end */}
      <mesh
        position={[0, 0, -0.155]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[XLR_R, XLR_R, 0.045, 28]} />
        <meshStandardMaterial
          color="#b8bcc0"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Dark plastic XLR end cap — holds the 3 pin holes */}
      <mesh position={[0, 0, -0.179]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[XLR_R * 0.86, XLR_R * 0.86, 0.005, 24]} />
        <meshStandardMaterial color="#050505" roughness={0.85} />
      </mesh>

      {/* 3 XLR pin holes in a triangle on the end cap */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(a) * XLR_R * 0.42,
            Math.sin(a) * XLR_R * 0.42,
            -0.1825,
          ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.0055, 0.0055, 0.006, 10]} />
          <meshStandardMaterial color="#050505" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
