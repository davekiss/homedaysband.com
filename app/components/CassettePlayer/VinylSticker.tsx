"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

// Die-cut "Homedays" vinyl sticker. Built as a flat plane with a canvas
// texture: white vinyl base layer (a wide rounded stroke under the text)
// with the brand wordmark inked on top in the site foreground color.
// The font is loaded from /fonts/theseasons-bd.otf via the global
// @font-face rule in app/globals.css.
//
// To remove: delete the <VinylSticker /> line in Scene.tsx and the
// import for this file.

const STICKER_W = 1.35;
const STICKER_H = 0.5;

type VinylStickerProps = {
  position: [number, number, number];
  rotation?: number; // Y rotation only — sticker lies flat on the table
};

export default function VinylSticker({
  position,
  rotation = 0,
}: VinylStickerProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;

    const build = async () => {
      // Make sure the brand font is actually loaded before we draw,
      // otherwise canvas will silently fall back to a generic serif
      // and the sticker won't match the rest of the site.
      try {
        await document.fonts.load('700 240px "Theseasons"');
      } catch {}
      if (cancelled) return;

      // Canvas aspect must match the plane aspect (STICKER_W / STICKER_H)
      // or the text will get squashed when sampled. 1350×500 = 2.7,
      // matching 1.35/0.5.
      const W = 1350;
      const H = 500;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);

      const text = "HOMEDAYS";

      // Pick a generous starting font size, then measure the actual
      // glyph width and scale down if the text + die-cut bleed wouldn't
      // fit horizontally inside the canvas. This makes the layout
      // robust to font fallback or future text changes.
      const desiredFontPx = 260;
      // Wide stroke = wide vinyl bleed around the wordmark. Sized big
      // enough that the stroke also fills the inner counters of O, D,
      // A, etc., so the white base reads as a single solid silhouette
      // around the entire word.
      const stroke = 110;
      const horizPad = 30;
      ctx.font = `700 ${desiredFontPx}px "Theseasons", Georgia, serif`;
      const measured = ctx.measureText(text).width;
      const maxTextWidth = W - 2 * horizPad - stroke;
      const fontPx =
        measured > maxTextWidth
          ? Math.floor((desiredFontPx * maxTextWidth) / measured)
          : desiredFontPx;
      ctx.font = `700 ${fontPx}px "Theseasons", Georgia, serif`;

      const cx = W / 2;
      const cy = H / 2 + Math.round(fontPx * 0.05);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 1) White vinyl base — wide rounded stroke under the text. The
      //    stroke is wider than any letter counter, so it fills in the
      //    centers of O, D, A, H instead of leaving die-cut holes there.
      ctx.strokeStyle = "#f6f1e2";
      ctx.lineWidth = stroke;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.miterLimit = 2;
      ctx.strokeText(text, cx, cy);
      ctx.fillStyle = "#f6f1e2";
      ctx.fillText(text, cx, cy);

      // 2) The actual ink layer — brand magenta with a tiny drop shadow
      ctx.shadowColor = "rgba(40, 20, 10, 0.32)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = "#a41b77";
      ctx.fillText(text, cx, cy);
      ctx.shadowColor = "transparent";

      // 3) Light fleck noise across the white base for printed-vinyl
      //    realism. We blend over the existing canvas, so this only
      //    shows up where the sticker actually exists (not the
      //    transparent background).
      ctx.globalCompositeOperation = "source-atop";
      for (let i = 0; i < 1400; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const a = Math.random() * 0.06;
        ctx.fillStyle = `rgba(40, 20, 10, ${a})`;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalCompositeOperation = "source-over";

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 16;
      tex.needsUpdate = true;
      if (!cancelled) setTexture(tex);
    };

    build();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!texture) return null;

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotation]}
      receiveShadow
    >
      <planeGeometry args={[STICKER_W, STICKER_H]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        roughness={0.55}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
