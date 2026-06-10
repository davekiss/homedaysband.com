"use client";

// Small casual pile of three guitar picks on the table. Each one can be
// picked up and inspected — while held it slowly twirls so you see the
// printed front, the beveled edge, and the back. Self-contained — to
// remove, delete the <GuitarPicks /> line and import in Scene.tsx along
// with this file.

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type GuitarPicksProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

const PILE_SCALE = 2;

// Classic "351" guitar pick silhouette — rounded shoulders tapering to a
// rounded point. Built as a 2D Shape on the XY plane (point at -Y), then
// extruded for thickness, then rotated flat so the final geometry lies
// face-up on the XZ plane with the pick's point along +Z and thickness
// along +Y. A small bevel softens the edge so it catches the light.
function createPickGeometry(thickness: number) {
  const shape = new THREE.Shape();
  // Classic 351 proportions: maximum width sits at the shoulders just below
  // the rounded top, then curves inward down to a rounded point.
  const w = 0.023;     // shoulder half-width (widest point of the pick)
  const tipY = -0.024; // point (bottom)
  const topY = 0.016;  // shoulder line / start of the top arc
  shape.moveTo(0, tipY);
  // Right flank: tip → right shoulder. The second control point sits
  // slightly outside the shoulder so the flank bulges out a bit before
  // rolling into the top arc, giving the pick its chunky shouldered look.
  shape.bezierCurveTo(
    w * 0.55, tipY + 0.006,
    w * 1.08, topY - 0.010,
    w, topY
  );
  // Top arc: right shoulder → left shoulder, curving up and over.
  shape.bezierCurveTo(
    w * 0.70, topY + 0.012,
    -w * 0.70, topY + 0.012,
    -w, topY
  );
  // Left flank: left shoulder → tip, mirror of the right flank.
  shape.bezierCurveTo(
    -w * 1.08, topY - 0.010,
    -w * 0.55, tipY + 0.006,
    0, tipY
  );

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: 0.0007,
    bevelSegments: 2,
    curveSegments: 20,
  });
  // Center the extruded depth on the origin so the pick sits symmetrically
  // around its own Y midline after we rotate it flat.
  geo.translate(0, 0, -thickness / 2);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

// ── Printed faces ───────────────────────────────────────────────────────
// Extrude UVs are a mess to print on, so each face gets a thin alpha-
// masked decal plane floated just above the surface instead. Canvas top =
// the pick's rounded top. The back face decal needs its artwork rotated
// 180° so it reads correctly when the pick is twirled around its vertical
// axis.

const PRINT_W = 256;
const PRINT_H = 266;

type DrawFn = (ctx: CanvasRenderingContext2D) => void;

function buildPrintTexture(draw: DrawFn, flip = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_W;
  canvas.height = PRINT_H;
  const ctx = canvas.getContext("2d")!;

  ctx.save();
  if (flip) {
    ctx.translate(PRINT_W / 2, PRINT_H / 2);
    ctx.rotate(Math.PI);
    ctx.translate(-PRINT_W / 2, -PRINT_H / 2);
  }
  draw(ctx);
  ctx.restore();

  // Grip wear — erode the print toward the middle where a thumb sits, so
  // the picks look gigged-with rather than fresh out of the bag.
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 300; i++) {
    const x =
      PRINT_W / 2 +
      ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * 78;
    const y =
      PRINT_H * 0.45 +
      ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * 64;
    const a = 0.4 + Math.random() * 0.5;
    ctx.fillStyle = `rgba(0, 0, 0, ${a})`;
    ctx.fillRect(x, y, 1 + Math.random() * 1.4, 1 + Math.random() * 1.4);
  }
  for (let i = 0; i < 3; i++) {
    const grad = ctx.createRadialGradient(
      PRINT_W * (0.35 + Math.random() * 0.3),
      PRINT_H * (0.3 + Math.random() * 0.3),
      0,
      PRINT_W * 0.5,
      PRINT_H * 0.45,
      8 + Math.random() * 8
    );
    grad.addColorStop(0, "rgba(0, 0, 0, 0.18)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PRINT_W, PRINT_H);
  }
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

const setLetterSpacing = (ctx: CanvasRenderingContext2D, px: number) => {
  (ctx as any).letterSpacing = `${px}px`;
};

type PickDesign = {
  thickness: number;
  body: {
    color: string;
    roughness: number;
    metalness: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
  fonts?: string[]; // document.fonts specs to await before drawing
  drawFront: DrawFn;
  drawBack: DrawFn;
};

// 1. Tortoise-shell amber — the band's own merch pick.
const homedaysPick: PickDesign = {
  thickness: 0.0020,
  body: {
    color: "#c87a2a",
    roughness: 0.28,
    metalness: 0.05,
    emissive: "#3a1800",
    emissiveIntensity: 0.05,
  },
  fonts: ['700 40px "Theseasons"'],
  drawFront: (ctx) => {
    const ink = "rgba(243, 233, 210, 0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const text = "HOMEDAYS";
    let size = 40;
    ctx.font = `700 ${size}px "Theseasons", Georgia, serif`;
    while (ctx.measureText(text).width > 188 && size > 16) {
      size -= 1;
      ctx.font = `700 ${size}px "Theseasons", Georgia, serif`;
    }
    ctx.fillStyle = ink;
    ctx.fillText(text, PRINT_W / 2, 108);
    setLetterSpacing(ctx, 3);
    ctx.font = "13px Georgia, serif";
    ctx.fillStyle = "rgba(243, 233, 210, 0.7)";
    ctx.fillText("CLEVELAND, OHIO", PRINT_W / 2, 152);
    setLetterSpacing(ctx, 0);
  },
  drawBack: (ctx) => {
    const ink = "rgba(243, 233, 210, 0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    ctx.font = "bold 36px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(".73 MM", PRINT_W / 2, 112);
    setLetterSpacing(ctx, 2);
    ctx.font = "13px 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(243, 233, 210, 0.65)";
    ctx.fillText("MADE IN OHIO", PRINT_W / 2, 154);
    setLetterSpacing(ctx, 0);
  },
};

// 2. Off-white celluloid — a heritage brand that never existed.
const lakeEriePick: PickDesign = {
  thickness: 0.0022,
  body: { color: "#ece3cd", roughness: 0.32, metalness: 0.05 },
  drawFront: (ctx) => {
    const ink = "rgba(42, 45, 58, 0.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    setLetterSpacing(ctx, 2);
    ctx.font = "bold 27px Georgia, serif";
    ctx.fillText("LAKE ERIE", PRINT_W / 2, 64);
    setLetterSpacing(ctx, 0);

    // Three stacked waves, old-catalog style
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      const y0 = 92 + row * 9;
      const half = 40 - row * 8;
      for (let x = -half; x <= half; x += 2) {
        const y = y0 + Math.sin((x / half) * Math.PI * 2) * 3;
        if (x === -half) ctx.moveTo(PRINT_W / 2 + x, y);
        else ctx.lineTo(PRINT_W / 2 + x, y);
      }
      ctx.stroke();
    }

    setLetterSpacing(ctx, 1);
    ctx.font = "bold 19px Georgia, serif";
    ctx.fillText("PLECTRUM CO.", PRINT_W / 2, 144);
    ctx.font = "italic 13px Georgia, serif";
    ctx.fillStyle = "rgba(42, 45, 58, 0.75)";
    ctx.fillText("Cleveland, O.", PRINT_W / 2, 172);
    setLetterSpacing(ctx, 0);
  },
  drawBack: (ctx) => {
    const ink = "rgba(42, 45, 58, 0.88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PRINT_W / 2 - 44, 96);
    ctx.lineTo(PRINT_W / 2 + 44, 96);
    ctx.moveTo(PRINT_W / 2 - 44, 142);
    ctx.lineTo(PRINT_W / 2 + 44, 142);
    ctx.stroke();
    setLetterSpacing(ctx, 4);
    ctx.font = "bold 23px Georgia, serif";
    ctx.fillText("MEDIUM", PRINT_W / 2, 119);
    setLetterSpacing(ctx, 0);
  },
};

// 3. Glossy black — easter egg for anyone who read the elephant-ear line
// in the notebook page on the same desk.
const elephantEarPick: PickDesign = {
  thickness: 0.0028,
  body: { color: "#1a1612", roughness: 0.28, metalness: 0.08 },
  drawFront: (ctx) => {
    const ink = "rgba(239, 233, 220, 0.92)";

    // Fried-dough spiral glyph
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    const cx = PRINT_W / 2;
    const cy = 74;
    for (let t = 0; t <= Math.PI * 5; t += 0.12) {
      const r = 1.5 + t * 1.45;
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t) * r * 0.9;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    setLetterSpacing(ctx, 2);
    ctx.font = "bold 28px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("ELEPHANT", PRINT_W / 2, 132);
    ctx.fillText("EAR", PRINT_W / 2, 164);
    setLetterSpacing(ctx, 0);
  },
  drawBack: (ctx) => {
    const ink = "rgba(239, 233, 220, 0.88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    setLetterSpacing(ctx, 4);
    ctx.font = "bold 24px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("HEAVY", PRINT_W / 2, 104);
    setLetterSpacing(ctx, 1);
    ctx.font = "20px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(239, 233, 220, 0.7)";
    ctx.fillText(".88 MM", PRINT_W / 2, 142);
    setLetterSpacing(ctx, 0);
  },
};

// 4. Emerald green — Cleveland Metroparks souvenir, gift-shop style.
const metroparksPick: PickDesign = {
  thickness: 0.0024,
  body: { color: "#1e5c38", roughness: 0.3, metalness: 0.05 },
  drawFront: (ctx) => {
    const ink = "rgba(240, 234, 216, 0.92)";

    // Little pine — three stacked boughs over a stubby trunk
    ctx.fillStyle = ink;
    const cx = PRINT_W / 2;
    const tiers: [number, number, number][] = [
      // [top y, half-width, height] from treetop down
      [38, 14, 20],
      [50, 20, 24],
      [64, 26, 28],
    ];
    for (const [top, half, height] of tiers) {
      ctx.beginPath();
      ctx.moveTo(cx, top);
      ctx.lineTo(cx + half, top + height);
      ctx.lineTo(cx - half, top + height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(cx - 3.5, 90, 7, 10);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setLetterSpacing(ctx, 2);
    ctx.font = "bold 24px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("CLEVELAND", PRINT_W / 2, 128);
    ctx.fillText("METROPARKS", PRINT_W / 2, 158);
    setLetterSpacing(ctx, 0);
  },
  drawBack: (ctx) => {
    const ink = "rgba(240, 234, 216, 0.88)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    setLetterSpacing(ctx, 3);
    ctx.font = "bold 17px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText("EMERALD NECKLACE", PRINT_W / 2, 108);
    setLetterSpacing(ctx, 1);
    ctx.font = "14px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "rgba(240, 234, 216, 0.7)";
    ctx.fillText("EST. 1917", PRINT_W / 2, 144);
    setLetterSpacing(ctx, 0);
  },
};

// ── Interactive pick ────────────────────────────────────────────────────

// Reusable temp objects for per-frame math (avoid GC churn)
const _restPos = new THREE.Vector3();
const _restQuat = new THREE.Quaternion();
const _heldPos = new THREE.Vector3();
const _heldQuat = new THREE.Quaternion();
const _spinQuat = new THREE.Quaternion();
const _lerpPos = new THREE.Vector3();
const _lerpQuat = new THREE.Quaternion();
const _forward = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _toCam = new THREE.Vector3();
const _right = new THREE.Vector3();
const _negUp = new THREE.Vector3();
const _basis = new THREE.Matrix4();
const _zAxis = new THREE.Vector3(0, 0, 1);

type InteractivePickProps = {
  design: PickDesign;
  restPosition: THREE.Vector3;
  restYRotation: number;
};

function InteractivePick({
  design,
  restPosition,
  restYRotation,
}: InteractivePickProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [prints, setPrints] = useState<{
    front: THREE.CanvasTexture;
    back: THREE.CanvasTexture;
  } | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frontMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const backMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const progressRef = useRef(0);
  const spinRef = useRef(0);
  const pickClickedRef = useRef(false);
  const { camera, gl } = useThree();

  const geometry = useMemo(
    () => createPickGeometry(design.thickness),
    [design]
  );

  // Decal textures are built async so the brand font is actually loaded
  // before we draw — same trick as VinylSticker.
  useEffect(() => {
    let cancelled = false;
    const build = async () => {
      if (design.fonts) {
        try {
          await Promise.all(design.fonts.map((f) => document.fonts.load(f)));
        } catch {}
      }
      if (cancelled) return;
      setPrints({
        front: buildPrintTexture(design.drawFront),
        back: buildPrintTexture(design.drawBack, true),
      });
    };
    build();
    return () => {
      cancelled = true;
    };
  }, [design]);

  const restQuatFixed = useMemo(
    () =>
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, restYRotation, 0)),
    [restYRotation]
  );

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(restPosition);
    groupRef.current.quaternion.copy(restQuatFixed);
  }, [restPosition, restQuatFixed]);

  // Click-away-to-put-down — same trick as the business card: R3F's click
  // fires first and flags pickClickedRef, so a bare canvas click means the
  // user clicked the background and the pick should drop back on the pile.
  useEffect(() => {
    if (!isPickedUp) return;
    const handler = () => {
      if (pickClickedRef.current) {
        pickClickedRef.current = false;
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

    // Idle twirl while held — like flipping a pick between your fingers.
    // The spin rides the held quaternion's local Z (the tip axis, vertical
    // on screen), so the front face, edge, and back face all get shown.
    if (isPickedUp) {
      spinRef.current += delta * 1.3;
    }

    _restPos.copy(restPosition);
    _restQuat.copy(restQuatFixed);

    // Held pose — face (+Y) toward the camera, rounded top up, tip down.
    // Much closer than the paper items since the pick is tiny.
    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 0.42)
      .addScaledVector(_camUp, -0.02);

    _toCam.copy(camera.position).sub(_heldPos).normalize();
    _right.crossVectors(_camUp, _toCam).normalize();
    _negUp.crossVectors(_right, _toCam);
    _basis.makeBasis(_right, _toCam, _negUp);
    _heldQuat.setFromRotationMatrix(_basis);
    _spinQuat.setFromAxisAngle(_zAxis, spinRef.current);
    _heldQuat.multiply(_spinQuat);

    _lerpPos.lerpVectors(_restPos, _heldPos, ease);
    _lerpQuat.slerpQuaternions(_restQuat, _heldQuat, ease);
    _lerpPos.y += 4 * ease * (1 - ease) * 0.2;

    group.position.copy(_lerpPos);
    group.quaternion.copy(_lerpQuat);

    // Brighten the print while held so it reads in the lamp light
    const glow = ease * 0.5;
    if (frontMatRef.current) frontMatRef.current.emissiveIntensity = glow;
    if (backMatRef.current) backMatRef.current.emissiveIntensity = glow;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    pickClickedRef.current = true;
    if (!isPickedUp) {
      spinRef.current = 0; // always greet with the front face
    }
    setIsPickedUp((v) => !v);
  };

  const t = design.thickness;
  const decalY = t * 0.85 + 0.0004;

  return (
    <group
      ref={groupRef}
      scale={PILE_SCALE}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={design.body.color}
          roughness={design.body.roughness}
          metalness={design.body.metalness}
          emissive={design.body.emissive ?? "#000000"}
          emissiveIntensity={design.body.emissiveIntensity ?? 0}
        />
      </mesh>

      {prints && (
        <>
          {/* Front print */}
          <mesh position={[0, decalY, -0.002]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 0.052]} />
            <meshStandardMaterial
              ref={frontMatRef}
              map={prints.front}
              emissiveMap={prints.front}
              emissive="#fff6e0"
              emissiveIntensity={0}
              transparent
              alphaTest={0.05}
              depthWrite={false}
              roughness={0.45}
              metalness={0.0}
            />
          </mesh>
          {/* Back print — artwork pre-rotated 180° so it reads correctly
              when the pick twirls around to show it */}
          <mesh position={[0, -decalY, -0.002]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 0.052]} />
            <meshStandardMaterial
              ref={backMatRef}
              map={prints.back}
              emissiveMap={prints.back}
              emissive="#fff6e0"
              emissiveIntensity={0}
              transparent
              alphaTest={0.05}
              depthWrite={false}
              roughness={0.45}
              metalness={0.0}
            />
          </mesh>
        </>
      )}

      {/* Generous invisible hit target — the real silhouette is a brutal
          click target, especially on phones */}
      <mesh position={[0, 0.004, 0.002]}>
        <boxGeometry args={[0.064, 0.016, 0.066]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── The pile ────────────────────────────────────────────────────────────

const PICKS: {
  design: PickDesign;
  offset: [number, number]; // x/z in the pile's local (pre-scale) space
  yRotation: number;
}[] = [
  { design: homedaysPick, offset: [-0.036, 0.008], yRotation: 0.4 },
  { design: lakeEriePick, offset: [0.014, -0.024], yRotation: -0.55 },
  { design: elephantEarPick, offset: [0.034, 0.028], yRotation: 1.1 },
  { design: metroparksPick, offset: [-0.075, -0.03], yRotation: -0.85 },
];

export default function GuitarPicks({
  position,
  rotation = [0, 0, 0],
}: GuitarPicksProps) {
  // Each pick animates in world space (the held pose is camera-relative),
  // so instead of nesting them under a transformed group we bake the pile's
  // position/rotation into per-pick world rest poses.
  const picks = useMemo(() => {
    const pileQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    return PICKS.map(({ design, offset, yRotation }) => {
      const local = new THREE.Vector3(
        offset[0] * PILE_SCALE,
        design.thickness * 0.5 * PILE_SCALE,
        offset[1] * PILE_SCALE
      ).applyQuaternion(pileQuat);
      return {
        design,
        restPosition: new THREE.Vector3(...position).add(local),
        restYRotation: (rotation[1] ?? 0) + yRotation,
      };
    });
  }, [position, rotation]);

  return (
    <>
      {picks.map((pick, i) => (
        <InteractivePick
          key={i}
          design={pick.design}
          restPosition={pick.restPosition}
          restYRotation={pick.restYRotation}
        />
      ))}
    </>
  );
}
