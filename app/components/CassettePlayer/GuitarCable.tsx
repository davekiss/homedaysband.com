"use client";

import { useMemo } from "react";
import * as THREE from "three";

const CABLE_RADIUS = 0.022;
const COIL_RADIUS = 0.32;
// 4.3 turns so the two tails DON'T land exactly opposite each other
// (which 4.5 or 4.0 would produce) — the end ends up roughly 108° off.
const COIL_TURNS = 4.3;

const PLUG_HOUSING_R = 0.05;
const PLUG_HOUSING_LEN = 0.13;
const PLUG_SLEEVE_R = 0.026;
const PLUG_SLEEVE_LEN = 0.06;
const PLUG_TIP_R = 0.022;
const PLUG_TIP_LEN = 0.07;

type GuitarCableProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
};

function Plug() {
  return (
    <group>
      {/* Strain relief / molded housing — wider at the cable end */}
      <mesh position={[0, PLUG_HOUSING_LEN / 2, 0]} castShadow>
        <cylinderGeometry
          args={[PLUG_HOUSING_R * 0.7, PLUG_HOUSING_R, PLUG_HOUSING_LEN, 18]}
        />
        <meshStandardMaterial color="#1a1a1a" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Chrome sleeve — collar between housing and shaft */}
      <mesh position={[0, PLUG_HOUSING_LEN + PLUG_SLEEVE_LEN / 2, 0]} castShadow>
        <cylinderGeometry
          args={[PLUG_SLEEVE_R, PLUG_SLEEVE_R, PLUG_SLEEVE_LEN, 18]}
        />
        <meshStandardMaterial color="#cfcbc4" roughness={0.28} metalness={0.9} />
      </mesh>
      {/* Black insulator ring */}
      <mesh
        position={[0, PLUG_HOUSING_LEN + PLUG_SLEEVE_LEN + 0.005, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[PLUG_TIP_R * 1.05, PLUG_TIP_R * 1.05, 0.01, 16]}
        />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} metalness={0.0} />
      </mesh>
      {/* Tip shaft */}
      <mesh
        position={[
          0,
          PLUG_HOUSING_LEN + PLUG_SLEEVE_LEN + 0.01 + PLUG_TIP_LEN / 2,
          0,
        ]}
        castShadow
      >
        <cylinderGeometry args={[PLUG_TIP_R, PLUG_TIP_R, PLUG_TIP_LEN, 18]} />
        <meshStandardMaterial color="#d8d4ce" roughness={0.22} metalness={0.92} />
      </mesh>
      {/* Rounded tip cap */}
      <mesh
        position={[
          0,
          PLUG_HOUSING_LEN + PLUG_SLEEVE_LEN + 0.01 + PLUG_TIP_LEN,
          0,
        ]}
        castShadow
      >
        <sphereGeometry args={[PLUG_TIP_R, 18, 10]} />
        <meshStandardMaterial color="#d8d4ce" roughness={0.22} metalness={0.92} />
      </mesh>
    </group>
  );
}

export default function GuitarCable({
  position,
  rotation = [0, 0, 0],
}: GuitarCableProps) {
  // Tweed cloth jacket — cream base with woven weft + scattered diagonal threads
  const tweedTexture = useMemo(() => {
    const w = 512;
    const h = 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Warm cream base
    ctx.fillStyle = "#d4bf85";
    ctx.fillRect(0, 0, w, h);

    // Vertical warp threads — fine variation across the cable's length
    for (let x = 0; x < w; x += 1) {
      const v = 0.12 + Math.random() * 0.18;
      ctx.fillStyle = `rgba(80, 55, 25, ${v})`;
      ctx.fillRect(x, 0, 1, h);
    }

    // Horizontal weft bands — the rib of the weave wrapping around the cable
    for (let y = 0; y < h; y += 2) {
      ctx.fillStyle = `rgba(50, 30, 10, ${0.15 + Math.random() * 0.15})`;
      ctx.fillRect(0, y, w, 1);
      ctx.fillStyle = `rgba(220, 195, 140, ${0.08 + Math.random() * 0.1})`;
      ctx.fillRect(0, y + 1, w, 1);
    }

    // Diagonal weave streaks — characteristic tweed flecks
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(${30 + Math.random() * 60}, ${20 + Math.random() * 30}, ${10 + Math.random() * 20}, ${0.4 + Math.random() * 0.3})`;
      ctx.lineWidth = 0.7 + Math.random() * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2 + Math.random() * 4, y + 1 + Math.random() * 2);
      ctx.stroke();
    }

    // Aging stains
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 1 + Math.random() * 2.5;
      ctx.fillStyle = `rgba(60, 35, 15, ${0.08 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(30, 4);
    tex.anisotropy = 16;
    return tex;
  }, []);

  const { tubeGeo, startPlugPos, startPlugQuat, endPlugPos, endPlugQuat } =
    useMemo(() => {
      const points: THREE.Vector3[] = [];

      // Free-end tail #1 — short straight run that the start plug attaches to.
      // Three explicit control points so Catmull-Rom has a clean linear lead-in
      // before the spiral picks up.
      points.push(new THREE.Vector3(-0.55, 0.04, 0.02));
      points.push(new THREE.Vector3(-0.45, 0.035, 0.02));
      points.push(new THREE.Vector3(-0.35, 0.03, 0.01));

      // Coiled section — spiral on the floor with smooth multi-scale wobble
      // and a slow drift of the coil center so loops aren't concentric.
      // No per-segment jitter — that made it look like a warbly noodle.
      const coilSegments = 160;
      const startAngle = Math.PI * 0.9;
      for (let i = 0; i <= coilSegments; i++) {
        const t = i / coilSegments;
        const angle = startAngle + t * Math.PI * 2 * COIL_TURNS;

        // Smoothly varying radius — a few sine harmonics only
        const r =
          COIL_RADIUS +
          Math.sin(angle * 0.5) * 0.025 +
          Math.sin(angle * 1.3 + 2.3) * 0.015 +
          t * 0.01;

        // Slow drift of the coil center in x/z — pulls some loops off-axis
        const cx = Math.sin(angle * 0.35 + 0.4) * 0.05;
        const cz = Math.cos(angle * 0.31 + 1.9) * 0.05;

        // Vertical wobble — loops lift and drop a bit, smoothly
        const y =
          0.03 +
          Math.sin(angle * 0.6 + 1.2) * 0.015 +
          Math.sin(angle * 1.4 + 0.3) * 0.008;

        points.push(
          new THREE.Vector3(
            cx + Math.cos(angle) * r,
            Math.max(0.018, y),
            cz + Math.sin(angle) * r
          )
        );
      }

      // Free-end tail #2 — 3 explicit points so Catmull-Rom gets a clean
      // lead-out. With 4.3 turns the coil exits around (-0.05, _, -0.34)
      // heading in +x, so the tail extends in that direction to its plug.
      points.push(new THREE.Vector3(0.06, 0.03, -0.34));
      points.push(new THREE.Vector3(0.18, 0.035, -0.32));
      points.push(new THREE.Vector3(0.32, 0.04, -0.29));

      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
      const tubeGeo = new THREE.TubeGeometry(
        curve,
        points.length * 3,
        CABLE_RADIUS,
        10,
        false
      );

      // Start plug — at curve point 0, oriented so its tip points opposite
      // the curve direction (away from the coil along the start tangent)
      const startPoint = points[0].clone();
      const startTangent = points[1].clone().sub(points[0]).normalize();
      const startPlugQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        startTangent.clone().negate()
      );

      // End plug — at curve point N, oriented so its tip continues in the
      // direction the curve was heading at the end (away from the coil)
      const endPoint = points[points.length - 1].clone();
      const endTangent = points[points.length - 1]
        .clone()
        .sub(points[points.length - 2])
        .normalize();
      const endPlugQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        endTangent
      );

      return {
        tubeGeo,
        startPlugPos: startPoint,
        startPlugQuat,
        endPlugPos: endPoint,
        endPlugQuat,
      };
    }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Tweed-jacketed cable */}
      <mesh geometry={tubeGeo} castShadow receiveShadow>
        <meshStandardMaterial
          map={tweedTexture}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* 1/4" plug at the free end of the coil */}
      <group position={startPlugPos} quaternion={startPlugQuat}>
        <Plug />
      </group>

      {/* 1/4" plug at the other end — also unplugged, resting on the floor */}
      <group position={endPlugPos} quaternion={endPlugQuat}>
        <Plug />
      </group>
    </group>
  );
}
