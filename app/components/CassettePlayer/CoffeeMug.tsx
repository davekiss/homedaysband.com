"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Heavy diner-style ceramic mug — thick rim, slight taper, big C handle
const MUG_OUTER_R = 0.3;
const MUG_BOTTOM_R = 0.26;
const MUG_INNER_R = 0.24;
const MUG_HEIGHT = 0.42;
const RIM_THICKNESS = 0.026;
const HANDLE_R = 0.12;
const HANDLE_TUBE = 0.038;
// Handle vertical center — sits low enough that the top attach point lands
// below the red stripe (which starts around y = 0.35).
const HANDLE_CENTER_Y = 0.17;

const CERAMIC_COLOR = "#f3ebdc";
const STRIPE_COLOR = "#7a2a18"; // classic restaurant-ware maroon band
const COFFEE_COLOR = "#1a0c04";

type CoffeeMugProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

export default function CoffeeMug({
  position,
  rotation = [0, 0, 0],
}: CoffeeMugProps) {
  // Coffee ring stain — drawn into a canvas as a darker rim with a faint
  // interior wash and a few splatters around the edge
  const stainTexture = useMemo(() => {
    const s = 256;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, s, s);

    const cx = s / 2;
    const cy = s / 2;
    const ringR = s * 0.4;

    // Faint interior wash — dried coffee residue inside the ring (very light)
    const interior = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringR);
    interior.addColorStop(0, "rgba(95, 55, 25, 0.02)");
    interior.addColorStop(0.5, "rgba(85, 50, 20, 0.04)");
    interior.addColorStop(1, "rgba(70, 40, 15, 0.08)");
    ctx.fillStyle = interior;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.fill();

    // Dark dried rim — where coffee meniscus pooled and evaporated.
    // Subdued so the ring reads as an old faint stain, not fresh paint.
    const rim = ctx.createRadialGradient(cx, cy, ringR * 0.85, cx, cy, ringR * 1.08);
    rim.addColorStop(0, "rgba(60, 30, 10, 0)");
    rim.addColorStop(0.35, "rgba(55, 25, 8, 0.22)");
    rim.addColorStop(0.55, "rgba(45, 20, 5, 0.32)");
    rim.addColorStop(0.75, "rgba(55, 25, 8, 0.2)");
    rim.addColorStop(1, "rgba(60, 30, 10, 0)");
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, s, s);

    // Splatter / drip marks just outside the ring — sparser and lighter
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = ringR * (0.95 + Math.random() * 0.18);
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const r = 0.7 + Math.random() * 2;
      ctx.fillStyle = `rgba(50, 25, 8, ${0.12 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // A couple of broken arc fragments — old partial rings, very faint
    ctx.strokeStyle = "rgba(55, 25, 8, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      const start = Math.random() * Math.PI * 2;
      const len = 0.4 + Math.random() * 0.6;
      const r = ringR * (1.02 + Math.random() * 0.05);
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + len);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Mug body — gently tapered cylinder, thick ceramic. Bottom sits at
          local y = 0 so the whole mug rests flat on the table surface. */}
      <mesh position={[0, MUG_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[MUG_OUTER_R, MUG_BOTTOM_R, MUG_HEIGHT, 40]}
        />
        <meshStandardMaterial
          color={CERAMIC_COLOR}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* Restaurant-ware stripe near the rim */}
      <mesh position={[0, MUG_HEIGHT * 0.86, 0]} castShadow>
        <cylinderGeometry
          args={[MUG_OUTER_R + 0.0015, MUG_OUTER_R + 0.0015, 0.022, 40]}
        />
        <meshStandardMaterial
          color={STRIPE_COLOR}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Inner wall ring — short open cylinder, makes the cup look hollow */}
      <mesh position={[0, MUG_HEIGHT - RIM_THICKNESS - 0.02, 0]}>
        <cylinderGeometry
          args={[MUG_INNER_R, MUG_INNER_R, 0.04, 40, 1, true]}
        />
        <meshStandardMaterial
          color="#e2d8c4"
          roughness={0.55}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Coffee surface — dark disc just below the rim */}
      <mesh position={[0, MUG_HEIGHT - RIM_THICKNESS - 0.012, 0]}>
        <cylinderGeometry args={[MUG_INNER_R - 0.001, MUG_INNER_R - 0.001, 0.002, 40]} />
        <meshStandardMaterial
          color={COFFEE_COLOR}
          roughness={0.15}
          metalness={0.25}
        />
      </mesh>

      {/* Bottom — recessed foot ring (the classic diner mug detail).
          Inset from the edge and positioned well above y=0 so it never
          pokes through the table surface. */}
      <mesh position={[0, 0.006, 0]} receiveShadow>
        <cylinderGeometry
          args={[MUG_BOTTOM_R - 0.02, MUG_BOTTOM_R - 0.02, 0.012, 32]}
        />
        <meshStandardMaterial
          color="#d8cfba"
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* C-handle — half torus. TorusGeometry only supports an `arc` (no
          thetaStart), so we generate the upper half (theta 0..π giving a
          U opening downward) and rotate it by -π/2 around Z so it opens
          toward the mug (-X) and bulges out into +X. The handle center sits
          slightly inside the mug body so the tube ends merge into the wall. */}
      <mesh
        position={[MUG_BOTTOM_R - 0.012, HANDLE_CENTER_Y, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow
      >
        <torusGeometry
          args={[HANDLE_R, HANDLE_TUBE, 14, 28, Math.PI]}
        />
        <meshStandardMaterial
          color={CERAMIC_COLOR}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* Coffee ring stain on the table — sits mostly under the mug with a
          slight offset so the ring peeks out from one side. The mug bottom
          covers the center; only the rim of the stain is visible. */}
      <mesh
        position={[-0.08, 0.0015, 0.07]}
        rotation={[-Math.PI / 2, 0, 0.7]}
      >
        <planeGeometry args={[0.72, 0.72]} />
        <meshStandardMaterial
          map={stainTexture}
          transparent
          depthWrite={false}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
