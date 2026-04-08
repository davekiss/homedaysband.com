"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type FirefliesProps = {
  count?: number;
  // Full-extent XYZ range the fireflies spawn within — matches drei's
  // Sparkles convention so it's easy to swap in/out.
  scale: [number, number, number];
  position?: [number, number, number];
  color?: string;
};

// Custom Points shader. drei's <Sparkles> only perturbs position
// from a single time*speed wave, and its fragment shader uses a
// 0.05/d - 0.1 falloff that clips hard at the sprite edge. We want:
//   1. Drift and blink to be *independent* time cycles per particle,
//      so a firefly can flash several times during one slow wobble.
//   2. A soft smoothstep falloff + additive blending so there are
//      no visible sprite quad edges when the bug is dim.
//   3. Smaller, per-particle size variety.
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aDriftSpeed;
  attribute float aBlinkSpeed;
  attribute float aBlinkPhase;
  attribute vec3 aNoise;
  varying float vBlink;

  void main() {
    vec3 pos = position;
    // Slow independent drift in all three axes. Each axis runs at
    // a different sub-multiple of aDriftSpeed so the motion isn't
    // a simple circle.
    pos.x += cos(uTime * aDriftSpeed + aNoise.x * 6.2831) * 0.07;
    pos.y += sin(uTime * aDriftSpeed * 0.85 + aNoise.y * 6.2831) * 0.11;
    pos.z += sin(uTime * aDriftSpeed * 0.6 + aNoise.z * 6.2831) * 0.008;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Blink cycle, fully decoupled from drift. pow(max(0, sin), 8)
    // spends most of its time near zero (dark) with brief, sharp
    // flashes — reads much more like a real firefly than a sine
    // fade. Each particle has its own aBlinkSpeed AND aBlinkPhase,
    // so no two blink in sync, and each fires multiple blinks
    // during a single drift wobble.
    float b = sin(uTime * aBlinkSpeed + aBlinkPhase);
    vBlink = pow(max(0.0, b), 8.0);

    gl_PointSize = aSize * uPixelRatio * (1.0 / -mvPosition.z);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vBlink;

  void main() {
    // Smooth radial falloff — no sharp sprite corners.
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.0, d) * vBlink;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export default function Fireflies({
  count = 14,
  scale,
  position = [0, 0, 0],
  color = "#d4ff88",
}: FirefliesProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geomData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const driftSpeeds = new Float32Array(count);
    const blinkSpeeds = new Float32Array(count);
    const blinkPhases = new Float32Array(count);
    const noises = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * scale[0];
      positions[i * 3 + 1] = (Math.random() - 0.5) * scale[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * scale[2];
      // Size is in raw pixels scaled by distance in the shader. At
      // the typical camera distance of ~7, size 20 reads as ~5px.
      sizes[i] = 18 + Math.random() * 22;
      // Slow wobble — one cycle takes many seconds.
      driftSpeeds[i] = 0.15 + Math.random() * 0.25;
      // Blink rate — much faster than drift so each firefly flashes
      // several times per drift cycle.
      blinkSpeeds[i] = 1.2 + Math.random() * 2.6;
      blinkPhases[i] = Math.random() * Math.PI * 2;
      noises[i * 3 + 0] = Math.random();
      noises[i * 3 + 1] = Math.random();
      noises[i * 3 + 2] = Math.random();
    }
    return { positions, sizes, driftSpeeds, blinkSpeeds, blinkPhases, noises };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, scale[0], scale[1], scale[2]]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: {
        value:
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio, 2)
            : 1,
      },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  useFrame((state) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime as { value: number }).value =
        state.clock.elapsedTime;
    }
  });

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[geomData.positions, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[geomData.sizes, 1]} />
        <bufferAttribute
          attach="attributes-aDriftSpeed"
          args={[geomData.driftSpeeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aBlinkSpeed"
          args={[geomData.blinkSpeeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aBlinkPhase"
          args={[geomData.blinkPhases, 1]}
        />
        <bufferAttribute
          attach="attributes-aNoise"
          args={[geomData.noises, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
