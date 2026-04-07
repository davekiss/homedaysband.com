"use client";

import { useMemo } from "react";
import * as THREE from "three";

const RUG_W = 14;
const RUG_H = 9.5;

type RugProps = {
  position: [number, number, number];
  rotation?: number; // Y rotation only — the rug always lies flat
};

export default function Rug({ position, rotation = 0 }: RugProps) {
  const { colorMap, normalMap, roughnessMap } = useMemo(() => {
    const w = 1024;
    const h = 680;

    // ============================================================
    // Color / diffuse texture
    // ============================================================
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = w;
    colorCanvas.height = h;
    const cctx = colorCanvas.getContext("2d")!;

    // Warm oatmeal base — gives a nice contrast against the dark wood floor
    // without fighting the warm lamp lighting in the rest of the scene.
    cctx.fillStyle = "#c2a883";
    cctx.fillRect(0, 0, w, h);

    // Subtle horizontal weave streaks — varying tone band-by-band
    for (let y = 0; y < h; y += 2) {
      const tone = 150 + Math.random() * 40;
      cctx.fillStyle = `rgba(${tone + 20}, ${tone}, ${tone - 35}, 0.35)`;
      cctx.fillRect(0, y, w, 1);
    }

    // Random fiber flecks — short little dashes in muted earth tones
    for (let i = 0; i < 14000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const tone = 100 + Math.random() * 110;
      const a = Math.random() * 0.28;
      cctx.fillStyle = `rgba(${tone + 20}, ${tone}, ${tone - 35}, ${a})`;
      cctx.fillRect(x, y, 1 + Math.random() * 1.6, 1);
    }

    // Outer border band — darker
    const borderW = 38;
    cctx.strokeStyle = "rgba(70, 45, 20, 0.55)";
    cctx.lineWidth = 6;
    cctx.strokeRect(borderW, borderW, w - borderW * 2, h - borderW * 2);

    // Inner accent line — thinner & lighter
    cctx.strokeStyle = "rgba(70, 45, 20, 0.32)";
    cctx.lineWidth = 2;
    cctx.strokeRect(
      borderW + 18,
      borderW + 18,
      w - borderW * 2 - 36,
      h - borderW * 2 - 36
    );

    // Soft vignette toward the corners — sells the "weight" of the fabric
    const grad = cctx.createRadialGradient(
      w / 2,
      h / 2,
      w * 0.2,
      w / 2,
      h / 2,
      w * 0.75
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(35, 22, 8, 0.32)");
    cctx.fillStyle = grad;
    cctx.fillRect(0, 0, w, h);

    // Sparse darker scuff/wear patches
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 30 + Math.random() * 80;
      const sg = cctx.createRadialGradient(x, y, 0, x, y, r);
      sg.addColorStop(0, "rgba(50, 30, 10, 0.12)");
      sg.addColorStop(1, "rgba(50, 30, 10, 0)");
      cctx.fillStyle = sg;
      cctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const colorMap = new THREE.CanvasTexture(colorCanvas);
    colorMap.wrapS = colorMap.wrapT = THREE.ClampToEdgeWrapping;
    colorMap.anisotropy = 16;
    colorMap.needsUpdate = true;

    // ============================================================
    // Normal map — fluffy carpet fiber look, derived from a 2-octave
    // height field via central-difference gradients.
    // ============================================================
    const normalCanvas = document.createElement("canvas");
    normalCanvas.width = w;
    normalCanvas.height = h;
    const nctx = normalCanvas.getContext("2d")!;

    // Build a height field
    const heights = new Float32Array(w * h);

    // Octave 1: 1-pixel high-frequency noise (fine fibers)
    for (let i = 0; i < heights.length; i++) {
      heights[i] = Math.random() * 0.45;
    }

    // Octave 2: ~4-pixel cells (small fluff tufts), bilinearly upsampled
    const cellSize = 4;
    const gw = Math.ceil(w / cellSize);
    const gh = Math.ceil(h / cellSize);
    const grid = new Float32Array(gw * gh);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random();
    for (let y = 0; y < h; y++) {
      const fy = y / cellSize;
      const y0 = Math.floor(fy);
      const y1 = Math.min(y0 + 1, gh - 1);
      const ty = fy - y0;
      for (let x = 0; x < w; x++) {
        const fx = x / cellSize;
        const x0 = Math.floor(fx);
        const x1 = Math.min(x0 + 1, gw - 1);
        const tx = fx - x0;
        const v00 = grid[y0 * gw + x0];
        const v10 = grid[y0 * gw + x1];
        const v01 = grid[y1 * gw + x0];
        const v11 = grid[y1 * gw + x1];
        const v =
          v00 * (1 - tx) * (1 - ty) +
          v10 * tx * (1 - ty) +
          v01 * (1 - tx) * ty +
          v11 * tx * ty;
        heights[y * w + x] += v * 0.55;
      }
    }

    // Derive normals via central difference on the height field
    const imageData = nctx.createImageData(w, h);
    const data = imageData.data;
    const strength = 220;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const xL = x > 0 ? x - 1 : 0;
        const xR = x < w - 1 ? x + 1 : w - 1;
        const yU = y > 0 ? y - 1 : 0;
        const yD = y < h - 1 ? y + 1 : h - 1;
        const hL = heights[y * w + xL];
        const hR = heights[y * w + xR];
        const hU = heights[yU * w + x];
        const hD = heights[yD * w + x];
        let nx = (hL - hR) * strength;
        let ny = (hU - hD) * strength;
        let nz = 1;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx /= len;
        ny /= len;
        nz /= len;
        const i = (y * w + x) * 4;
        data[i] = Math.floor(nx * 127 + 128);
        data[i + 1] = Math.floor(ny * 127 + 128);
        data[i + 2] = Math.floor(nz * 127 + 128);
        data[i + 3] = 255;
      }
    }
    nctx.putImageData(imageData, 0, 0);

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
    normalMap.anisotropy = 16;
    normalMap.needsUpdate = true;

    // ============================================================
    // Roughness map — a touch of variation so highlights don't look
    // perfectly uniform across the surface.
    // ============================================================
    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = w;
    roughCanvas.height = h;
    const rctx = roughCanvas.getContext("2d")!;
    rctx.fillStyle = "#cccccc";
    rctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 5 + Math.random() * 20;
      const v = 180 + Math.random() * 60;
      const rg = rctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${v},${v},${v},0.5)`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      rctx.fillStyle = rg;
      rctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const roughnessMap = new THREE.CanvasTexture(roughCanvas);
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
    roughnessMap.anisotropy = 16;
    roughnessMap.needsUpdate = true;

    return { colorMap, normalMap, roughnessMap };
  }, []);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotation]}
      receiveShadow
    >
      <planeGeometry args={[RUG_W, RUG_H]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.9, 0.9)}
        roughnessMap={roughnessMap}
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  );
}
