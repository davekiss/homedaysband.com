"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Film grain noise
  float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Subtle barrel distortion (CRT-like)
    vec2 centered = uv - 0.5;
    float dist = dot(centered, centered);
    uv = uv + centered * dist * 0.03;

    vec4 color = texture2D(tDiffuse, uv);

    // Warm color shift - push toward amber/sepia
    color.r *= 1.08;
    color.g *= 1.02;
    color.b *= 0.92;

    // Subtle scanlines
    float scanline = sin(uv.y * uResolution.y * 1.5) * 0.02;
    color.rgb -= scanline;

    // Film grain
    float grain = random(uv * uTime) * 0.06 - 0.03;
    color.rgb += grain;

    // Very subtle vignette
    float vignette = 1.0 - dist * 0.8;
    color.rgb *= vignette;

    // Slight contrast boost
    color.rgb = (color.rgb - 0.5) * 1.05 + 0.5;

    gl_FragColor = color;
  }
`;

export default function VintageShader() {
  const { gl, scene, camera, size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const renderTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    [size.width, size.height]
  );

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: renderTarget.texture },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [renderTarget.texture, size.width, size.height]
  );

  useFrame((state) => {
    // Render scene to off-screen target
    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  }, 1);

  return (
    <mesh renderOrder={999}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
