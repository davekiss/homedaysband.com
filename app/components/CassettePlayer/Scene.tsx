"use client";

import { useRef, useCallback, useMemo, Suspense, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useTexture, useVideoTexture, OrbitControls, useFBO, Image, Decal } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { EffectComposer, Noise, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import CassetteTape from "./CassetteTape";
import TapeDeck from "./TapeDeck";
import TransportControls from "./TransportControls";
import VUMeter from "./VUMeter";
import StringLights from "./StringLights";
import type { Track, PlayerState } from "./useAudioPlayer";

type SceneProps = {
  tracks: Track[];
  playerState: PlayerState;
  currentTrackIndex: number | null;
  progress: number;
  duration: number;
  onSelectTrack: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onEject: () => void;
  onStopFastAction: () => void;
  getFrequencyData: () => Uint8Array;
  volume: number;
  onVolumeChange: (vol: number) => void;
};

const TAPE_COLORS = ["#c4956a", "#7a8c6e", "#8a7a6a", "#6a7a8c", "#9c8a6a", "#7c6a5a", "#6a8a7a", "#8c7a7a", "#7a6a5a", "#6a7a6a"];

// Scattered positions on the table for tapes not inserted
// Spread across the table: left, right, above (behind), below (in front) of the deck
// [x, y, z, yRotation] — casual rotations on the table
const TABLE_POSITIONS: [number, number, number, number][] = [
  [-2.3, -0.2, 0.6, 0.3],
  [-2.0, -0.2, -1.4, -0.5],
  [-3.2, -0.2, -0.5, 0.8],
  [2.3, -0.2, 0.5, -0.2],
  [2.8, -0.2, -1.2, 0.6],
  [1.8, -0.2, -1.8, -0.9],
  [-1.5, -0.2, 1.5, 0.15],
  [0.8, -0.2, 1.6, -0.4],
  [-0.5, -0.2, -2.0, 1.1],
  [3.0, -0.2, -0.2, -0.7],
  [-3.5, -0.2, 1.2, -0.35],
  [0.5, -0.2, -1.4, 0.45],
];

function Tabletop() {
  const texture = useTexture("/tex/Texturelabs_Wood_267XL.jpg");
  return (
    <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
      <boxGeometry args={[10, 0.12, 6]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
    </mesh>
  );
}

function Floor() {
  const textures = useTexture({
    map: "/tex/hardwood2_diffuse.jpg",
    bumpMap: "/tex/hardwood2_bump.jpg",
    roughnessMap: "/tex/hardwood2_roughness.jpg",
  });
  Object.values(textures).forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
  });
  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial {...textures} color="#5a4030" bumpScale={0.3} roughness={0.8} metalness={0.0} />
    </mesh>
  );
}

function Walls() {
  const wallMaterial = (
    <meshStandardMaterial color="#4a5a52" roughness={0.95} metalness={0.0} />
  );
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 3, -6]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        {wallMaterial}
      </mesh>
      {/* Left wall */}
      <mesh position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        {wallMaterial}
      </mesh>
      {/* Right wall */}
      <mesh position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        {wallMaterial}
      </mesh>
      {/* Front wall (behind camera) */}
      <mesh position={[0, 3, 6]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        {wallMaterial}
      </mesh>
      {/* Baseboards */}
      {/* Front */}
      <mesh position={[0, -1.35, 5.95]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[16, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Back */}
      <mesh position={[0, -1.35, -5.95]}>
        <boxGeometry args={[16, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Left */}
      <mesh position={[-7.95, -1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Right */}
      <mesh position={[7.95, -1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[16, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
}

// Mural on the left wall — remove <Mural /> from Scene to disable
function Mural() {
  const muralTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Deep navy background
    ctx.fillStyle = "#1a2233";
    ctx.fillRect(0, 0, 512, 512);

    // Large sun/moon circle — warm gold
    const cx = 256, cy = 200, r = 120;
    const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sunGrad.addColorStop(0, "#f5c870");
    sunGrad.addColorStop(0.7, "#e8a040");
    sunGrad.addColorStop(1, "#c47020");
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal stripes through the sun (vintage print effect)
    for (let y = cy - r; y < cy + r; y += 8) {
      ctx.fillStyle = `rgba(26,34,51,${0.1 + Math.random() * 0.15})`;
      ctx.fillRect(cx - r, y, r * 2, 3);
    }

    // Mountain silhouettes
    ctx.fillStyle = "#2a3a4a";
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(80, 260);
    ctx.lineTo(180, 310);
    ctx.lineTo(260, 230);
    ctx.lineTo(340, 290);
    ctx.lineTo(420, 240);
    ctx.lineTo(512, 300);
    ctx.lineTo(512, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    // Foreground ridge
    ctx.fillStyle = "#1a2a38";
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(100, 360);
    ctx.lineTo(200, 380);
    ctx.lineTo(300, 340);
    ctx.lineTo(400, 370);
    ctx.lineTo(512, 350);
    ctx.lineTo(512, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    // Subtle radiating lines from sun
    ctx.strokeStyle = "rgba(245,200,112,0.12)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (r + 10), cy + Math.sin(angle) * (r + 10));
      ctx.lineTo(cx + Math.cos(angle) * 300, cy + Math.sin(angle) * 300);
      ctx.stroke();
    }

    // Worn/aged overlay
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[-7.94, 1.8, -2]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshStandardMaterial color="#4a5a52" roughness={0.95} metalness={0.0} />
      <Decal
        position={[0, 0, 0.001]}
        rotation={[0, 0, 0]}
        scale={[2.4, 2.4, 1]}
        map={muralTexture}
      >
        <meshStandardMaterial
          map={muralTexture}
          roughness={0.85}
          metalness={0.0}
          toneMapped
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </Decal>
    </mesh>
  );
}

// Separate component so useVideoTexture can suspend independently
function WindowSky({ width, height, z }: { width: number; height: number; z: number }) {
  const cloudsTexture = useVideoTexture("/videos/clouds.mp4", { muted: true, loop: true, playsInline: true });
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={cloudsTexture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function WindowLight() {
  const { gl } = useThree();
  useEffect(() => {
    RectAreaLightUniformsLib.init();
  }, []);
  return null;
}

function Window() {
  const frameColor = "#f0ece4";
  const frameDepth = 0.15;
  const frameMat = <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.05} />;

  const windowW = 3;
  const windowH = 4;
  const frameThickness = 0.1;
  const mullionThickness = 0.06;
  const paneW = (windowW - frameThickness * 2 - mullionThickness) / 2;
  const paneH = (windowH - frameThickness * 2 - mullionThickness * 2) / 3;

  const wallX = 7.95;
  const centerY = 1.5;
  const centerZ = -2;

  const skyW = windowW - frameThickness * 2;
  const skyH = windowH - frameThickness * 2;

  return (
    <group position={[wallX, centerY, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Top */}
      <mesh position={[0, windowH / 2 - frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[windowW, frameThickness, frameDepth]} />
        {frameMat}
      </mesh>
      {/* Bottom (sill) */}
      <mesh position={[0, -windowH / 2 + frameThickness / 2, 0.05]} castShadow>
        <boxGeometry args={[windowW + 0.2, frameThickness, frameDepth + 0.1]} />
        {frameMat}
      </mesh>
      {/* Left */}
      <mesh position={[-windowW / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, windowH, frameDepth]} />
        {frameMat}
      </mesh>
      {/* Right */}
      <mesh position={[windowW / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, windowH, frameDepth]} />
        {frameMat}
      </mesh>

      {/* Vertical mullion */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[mullionThickness, windowH - frameThickness * 2, frameDepth * 0.6]} />
        {frameMat}
      </mesh>

      {/* Horizontal mullions */}
      {[-1, 1].map((dir, i) => (
        <mesh key={i} position={[0, dir * (paneH * 0.55 + mullionThickness / 2), 0]} castShadow>
          <boxGeometry args={[windowW - frameThickness * 2, mullionThickness, frameDepth * 0.6]} />
          {frameMat}
        </mesh>
      ))}

      {/* Clouds video behind the window — wrapped in Suspense */}
      <Suspense fallback={
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[skyW, skyH]} />
          <meshBasicMaterial color="#8aaccf" side={THREE.DoubleSide} />
        </mesh>
      }>
        <WindowSky width={skyW} height={skyH} z={0} />
      </Suspense>

      {/* Venetian blinds */}
      {(() => {
        const slatCount = 28;
        const slatWidth = skyH / slatCount;
        const slatDepth = 0.008;
        const slatAngle = Math.PI * 0.28; // tilted open
        const blindsZ = frameDepth / 2 - 0.01;
        return Array.from({ length: slatCount }, (_, i) => {
          const y = -skyH / 2 + slatWidth / 2 + i * slatWidth;
          return (
            <mesh key={i} position={[0, y, blindsZ]} rotation={[slatAngle, 0, 0]}>
              <boxGeometry args={[skyW - 0.04, slatWidth * 0.85, slatDepth]} />
              <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
            </mesh>
          );
        });
      })()}
      {/* Blinds cord — left and right */}
      {[-skyW / 4, skyW / 4].map((x, i) => (
        <mesh key={i} position={[x, 0, frameDepth / 2 - 0.005]}>
          <cylinderGeometry args={[0.003, 0.003, skyH, 4]} />
          <meshStandardMaterial color="#d8d0c4" roughness={0.8} />
        </mesh>
      ))}

      {/* Glass panes — slight tint */}
      <mesh position={[0, 0, frameDepth / 2 + 0.01]}>
        <planeGeometry args={[skyW, skyH]} />
        <meshBasicMaterial color="#c8dce8" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Daylight pouring in from the window */}
      <rectAreaLight
        position={[0, 0, frameDepth / 2 + 0.15]}
        rotation={[0, Math.PI, 0]}
        width={skyW}
        height={skyH}
        intensity={4}
        color="#b8d4e8"
      />
    </group>
  );
}

export default function Scene({
  tracks,
  playerState,
  currentTrackIndex,
  progress,
  duration,
  onSelectTrack,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onEject,
  onStopFastAction,
  getFrequencyData,
  volume,
  onVolumeChange,
}: SceneProps) {
  const cameraGroupRef = useRef<THREE.Group>(null);
  const tapesGroupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<any>(null);

  const setOrbitEnabled = useCallback((enabled: boolean) => {
    if (orbitRef.current) orbitRef.current.enabled = enabled;
  }, []);

  // Shared FBO for all MeshTransmissionMaterial instances
  const transmissionFBO = useFBO(2048, 2048);

  // Render scene to shared FBO (hiding tapes to avoid recursion), then idle sway
  useFrame((state) => {
    if (!cameraGroupRef.current) return;

    // Render background into shared transmission buffer
    if (tapesGroupRef.current) {
      tapesGroupRef.current.visible = false;
      state.gl.setRenderTarget(transmissionFBO);
      state.gl.render(state.scene, state.camera);
      state.gl.setRenderTarget(null);
      tapesGroupRef.current.visible = true;
    }

    // Gentle idle camera sway
    const t = state.clock.elapsedTime;
    cameraGroupRef.current.rotation.y = Math.sin(t * 0.15) * 0.015;
    cameraGroupRef.current.rotation.x = Math.sin(t * 0.1) * 0.005;
  });

  const handleTapeClick = useCallback(
    (index: number) => {
      if (currentTrackIndex === index) return; // Already inserted
      onSelectTrack(index);
    },
    [currentTrackIndex, onSelectTrack]
  );

  return (
    <>
      {/* Initialize RectAreaLight uniforms */}
      <WindowLight />

      {/* Very low ambient — most light comes from lamps */}
      <ambientLight intensity={0.25} color="#e8d0b0" />

      {/* Table lamp — left side, warm and close */}
      <pointLight
        position={[-2.5, 0.8, 0.5]}
        intensity={6}
        color="#f5d0a0"
        distance={8}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Floor lamp — back-left corner, taller */}
      <pointLight
        position={[-5, 2.2, -3.5]}
        intensity={11}
        color="#e8c490"
        distance={12}
        decay={2}
      />

      {/* Side table lamp — right side, slightly behind */}
      <pointLight
        position={[4, 0.6, -1]}
        intensity={3}
        color="#f0d8a8"
        distance={7}
        decay={2}
      />

      {/* Reading lamp — closer to the deck, lower */}
      <pointLight
        position={[1, 1.2, 1.5]}
        intensity={6}
        color="#f5dbb0"
        distance={6}
        decay={2}
      />

      {/* Dim warm glow from window area — evening light */}
      <pointLight
        position={[6, 1.5, -2]}
        intensity={3}
        color="#c4a878"
        distance={10}
        decay={2}
      />

      <group ref={cameraGroupRef} position={[0, -0.18, 0]}>
        {/* The deck */}
        <TapeDeck volume={volume} onVolumeChange={onVolumeChange} setOrbitEnabled={setOrbitEnabled} />

        {/* VU level meter — between volume dial and transport buttons */}
        <VUMeter
          position={[-0.4, 0.02, 0.6]}
          getFrequencyData={getFrequencyData}
          isPlaying={playerState === "playing"}
        />

        {/* Transport buttons */}
        <TransportControls
          playerState={playerState}
          hasTrack={currentTrackIndex !== null}
          onPlay={onPlay}
          onPause={onPause}
          onStop={onStop}
          onRewind={onRewind}
          onFastForward={onFastForward}
          onEject={onEject}
          onStopFastAction={onStopFastAction}
        />

        {/* Cassette tapes — wrapped in group for shared transmission FBO */}
        <group ref={tapesGroupRef}>
          {tracks.map((track, i) => (
            <CassetteTape
              key={i}
              label={track.title}
              color={TAPE_COLORS[i % TAPE_COLORS.length]}
              isInserted={currentTrackIndex === i}
              playerState={currentTrackIndex === i ? playerState : "idle"}
              progress={currentTrackIndex === i ? progress : 0}
              duration={currentTrackIndex === i ? duration : 0}
              onClick={() => handleTapeClick(i)}
              transmissionBuffer={transmissionFBO.texture}
              position={[TABLE_POSITIONS[i % TABLE_POSITIONS.length][0], TABLE_POSITIONS[i % TABLE_POSITIONS.length][1], TABLE_POSITIONS[i % TABLE_POSITIONS.length][2]]}
              tableRotation={TABLE_POSITIONS[i % TABLE_POSITIONS.length][3]}
            />
          ))}
        </group>
      </group>

      {/* String lights across the back wall */}
      <StringLights />

      {/* Window */}
      <Window />

      {/* Dust motes — disabled for now */}

      {/* Youth Pallet poster on back wall */}
      <Image
        url="/images/Youth Pallet.JPG"
        scale={[1.8, 2.3]}
        position={[-3, 1.8, -5.94]}
        toneMapped
        color="#888888"
      />

      {/* Mural on left wall — remove this line to disable */}
      <Mural />

      {/* Tabletop surface */}
      <Tabletop />

      {/* Hardwood floor beneath the table */}
      <Floor />

      {/* Brick walls */}
      <Walls />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.3}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={1}
          intensity={0.8}
          luminanceSmoothing={0.025}
        />
        <Noise
          premultiply
          blendFunction={BlendFunction.ADD}
        />
        <Vignette
          offset={0.4}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
        <DepthOfField
          focusDistance={0}
          focalLength={0.01}
          bokehScale={0.8}
        />
      </EffectComposer>
    </>
  );
}
