"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const NOTE_W = 0.55;
const NOTE_H = 0.55;

type PostItNoteProps = {
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

export default function PostItNote({
  position,
  rotation = [0, 0, 0],
}: PostItNoteProps) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const { camera, gl } = useThree();

  const noteTexture = useMemo(() => {
    const w = 512;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Yellow post-it base — subtle top-to-bottom gradient suggests
    // a slight curl/shadow on the lower half
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#fff27a");
    bg.addColorStop(1, "#f2d44c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Adhesive strip across the top — a faint darker band where the glue sits
    const glue = ctx.createLinearGradient(0, 0, 0, h * 0.18);
    glue.addColorStop(0, "rgba(180, 140, 20, 0.16)");
    glue.addColorStop(1, "rgba(180, 140, 20, 0)");
    ctx.fillStyle = glue;
    ctx.fillRect(0, 0, w, h * 0.18);

    // Paper fibers / grain — fine random flecks
    for (let i = 0; i < 2200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * 0.05;
      ctx.fillStyle = `rgba(100, 80, 20, ${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Ink color — dark blue pen
    const INK = "22, 30, 95";
    const handFont = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive";

    // Draw a string of text as individual characters with per-char jitter
    // and random ink-density drops ("pen running out" skipping look).
    const drawHandText = (
      text: string,
      startX: number,
      startY: number,
      angle = 0
    ) => {
      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(angle);
      let cx = 0;
      for (const char of text) {
        const jx = (Math.random() - 0.5) * 1.4;
        const jy = (Math.random() - 0.5) * 2;
        // Mostly fairly-inked, but occasionally the pen "skips" and drops
        // ink density hard for a run of characters
        let ink = 0.62 + Math.random() * 0.32;
        if (Math.random() < 0.14) {
          ink = 0.12 + Math.random() * 0.22;
        }
        ctx.fillStyle = `rgba(${INK}, ${ink})`;
        ctx.fillText(char, cx + jx, jy);
        // Occasional double-strike on a heavier letter
        if (Math.random() < 0.06) {
          ctx.fillStyle = `rgba(${INK}, 0.35)`;
          ctx.fillText(char, cx + jx + 0.4, jy + 0.3);
        }
        cx += ctx.measureText(char).width;
      }
      ctx.restore();
    };

    // Title: "TO-DO"
    ctx.font = `bold 58px ${handFont}`;
    ctx.textBaseline = "top";
    drawHandText("TO-DO", 48, 70, -0.035);

    // Wobbly underline beneath the title — slightly faded on the right
    // side to sell the pen-running-out story
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = 48; x <= 230; x += 6) {
      const y = 148 + (Math.random() - 0.5) * 2.5;
      if (x === 48) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${INK}, 0.7)`;
    ctx.stroke();

    // --- Item 1: empty checkbox + "figure out Instagram" + handle ---
    ctx.strokeStyle = `rgba(${INK}, 0.8)`;
    ctx.lineWidth = 3;
    const box1x = 55;
    const box1y = 205;
    const boxSize = 32;
    // Wobbly checkbox — drawn as four slightly offset straight segments
    ctx.beginPath();
    ctx.moveTo(box1x + 1, box1y);
    ctx.lineTo(box1x + boxSize, box1y + 2);
    ctx.moveTo(box1x + boxSize + 1, box1y + 1);
    ctx.lineTo(box1x + boxSize - 1, box1y + boxSize);
    ctx.moveTo(box1x + boxSize, box1y + boxSize + 1);
    ctx.lineTo(box1x, box1y + boxSize - 1);
    ctx.moveTo(box1x - 1, box1y + boxSize);
    ctx.lineTo(box1x, box1y);
    ctx.stroke();

    ctx.font = `36px ${handFont}`;
    drawHandText("figure out how", box1x + boxSize + 18, box1y - 6);
    drawHandText("to use Instagram", box1x + boxSize + 18, box1y + 40);

    ctx.font = `32px ${handFont}`;
    drawHandText("@homedaysband", box1x + boxSize + 48, box1y + 92);

    // --- Item 2: checkbox + "make a TikTok?" — scratched out ---
    const box2x = 55;
    const box2y = 370;
    ctx.strokeStyle = `rgba(${INK}, 0.8)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(box2x + 1, box2y);
    ctx.lineTo(box2x + boxSize, box2y + 2);
    ctx.moveTo(box2x + boxSize + 1, box2y + 1);
    ctx.lineTo(box2x + boxSize - 1, box2y + boxSize);
    ctx.moveTo(box2x + boxSize, box2y + boxSize + 1);
    ctx.lineTo(box2x, box2y + boxSize - 1);
    ctx.moveTo(box2x - 1, box2y + boxSize);
    ctx.lineTo(box2x, box2y);
    ctx.stroke();

    ctx.font = `38px ${handFont}`;
    drawHandText("make a TikTok?", box2x + boxSize + 18, box2y - 4);

    // Angry scratch-out — zig-zag scribble + two diagonal slashes,
    // all over the TikTok text. Rendered semi-opaque so you can still
    // read the phrase underneath.
    ctx.strokeStyle = `rgba(${INK}, 0.72)`;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const scratchLeft = box2x + boxSize + 6;
    const scratchRight = 470;
    const scratchCenterY = box2y + 18;
    ctx.beginPath();
    ctx.moveTo(scratchLeft, scratchCenterY);
    for (let x = scratchLeft; x <= scratchRight; x += 5) {
      const y =
        scratchCenterY +
        Math.sin((x - scratchLeft) * 0.25) * 12 +
        (Math.random() - 0.5) * 4;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Two crossing slashes
    ctx.beginPath();
    ctx.moveTo(scratchLeft + 4, scratchCenterY + 20);
    ctx.lineTo(scratchRight - 4, scratchCenterY - 18);
    ctx.moveTo(scratchLeft + 4, scratchCenterY - 18);
    ctx.lineTo(scratchRight - 4, scratchCenterY + 20);
    ctx.stroke();

    // Subtle corner shadow/crease
    ctx.strokeStyle = "rgba(120, 90, 20, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.02, h * 0.92);
    ctx.lineTo(w * 0.16, h * 0.99);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Fixed "resting on the table" pose:
  //   Lay flat by rotating -90° around X, then spin around world-Y for a
  //   casual twist off-axis.
  const tablePosFixed = useMemo(() => new THREE.Vector3(...position), [position]);
  const tableQuatFixed = useMemo(() => {
    const flat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI / 2, 0, 0)
    );
    const spin = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      rotation[1] ?? 0
    );
    return spin.multiply(flat);
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

    // Held pose — brought closer than the notebook since the post-it is small
    _forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    _heldPos
      .copy(camera.position)
      .addScaledVector(_forward, 1.25)
      .addScaledVector(_camUp, -0.05);

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
      <mesh castShadow receiveShadow>
        <planeGeometry args={[NOTE_W, NOTE_H]} />
        <meshStandardMaterial
          map={noteTexture}
          roughness={0.9}
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
