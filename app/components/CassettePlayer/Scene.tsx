"use client";

import { useRef, useCallback, Suspense, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, useVideoTexture, OrbitControls, useFBO, Image } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { EffectComposer, Noise, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import CassetteTape from "./CassetteTape";
import TapeDeck from "./TapeDeck";
import TransportControls from "./TransportControls";
import VUMeter from "./VUMeter";
import StringLights from "./StringLights";
import GuitarAmp from "./GuitarAmp";
import GuitarCable from "./GuitarCable";
import Microphone from "./Microphone";
import Polaroid from "./Polaroid";
import NotebookPaper from "./NotebookPaper";
import PostItNote from "./PostItNote";
import Pen from "./Pen";
import VinylSticker from "./VinylSticker";
import CoffeeMug from "./CoffeeMug";
import GuitarPicks from "./GuitarPicks";
import FloorLamp from "./FloorLamp";
import DoorWithFrame from "./DoorWithFrame";
import DoorStopper from "./DoorStopper";
import FloatingShelf from "./FloatingShelf";
import Bookcase from "./Bookcase";
import Rug from "./Rug";
import Fireflies from "./Fireflies";
import { muxStatic } from "./mux";

const CLOUDS_VIDEO_URL = muxStatic(
  "LTyk5dOSo9Gr2iIkbnPdbPkof4ZBcaGpFw3LdWb2m5o",
  "highest.mp4"
);
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
  // When true, skip the expensive extras: no per-frame transmission
  // FBO render, no post-processing, no auto-rotate or idle sway, no
  // shadow-casting lights, and cassette bodies fall back to vanilla
  // physical material instead of MeshTransmissionMaterial.
  isMobile: boolean;
};

const TAPE_COLORS = ["#c4956a", "#7a8c6e", "#8a7a6a", "#6a7a8c", "#9c8a6a", "#7c6a5a", "#6a8a7a", "#8c7a7a", "#7a6a5a", "#6a7a6a"];

// Per-tape body shell style (indexes into BODY_STYLES inside CassetteTape):
//   0 = smoke black (default), 1 = charcoal gray,
//   2 = clear smoke (translucent dark), 3 = vintage cream/ivory.
// Easy to undo: replace with all 0s, or delete this constant and the
// `bodyStyleIndex` prop on the <CassetteTape /> below.
const TAPE_BODY_STYLES: number[] = [
  0, // smoke black
  1, // charcoal gray
  0, // smoke black
  2, // clear smoke
  0, // smoke black
  0, // smoke black
  3, // cream
  1, // charcoal gray
  0, // smoke black
  2, // clear smoke
  0, // smoke black
  3, // cream
];

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
      {/* Front wall (behind camera) — split into a frame around a
          rectangular cutout for the built-in bookcase. The bookcase
          spans x [-1.5, 0.5] (center -0.5, width 2.0) and y [-1.5, 1.2]
          (bottom on floor, height 2.7). We leave a matching hole in the
          wall plane so the case sits in a real recessed alcove instead
          of z-fighting the wall. The bookcase's crown cap overhangs 0.03
          on each side and on top, so the seam between the wall and the
          case is covered by the trim. */}
      {/* Front wall: left strip (x = -8 → -1.5, width 6.5) */}
      <mesh position={[-4.75, 3, 6]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[6.5, 10]} />
        {wallMaterial}
      </mesh>
      {/* Front wall: right strip (x = 0.5 → 8, width 7.5) */}
      <mesh position={[4.25, 3, 6]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[7.5, 10]} />
        {wallMaterial}
      </mesh>
      {/* Front wall: top strip over the cutout (y = 1.2 → 8, height 6.8) */}
      <mesh position={[-0.5, 4.6, 6]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[2, 6.8]} />
        {wallMaterial}
      </mesh>
      {/* Alcove back panel — closes off the recess behind the bookcase
          so the camera can't see through to empty space. Sits just
          behind the bookcase's own back panel. */}
      <mesh position={[-0.5, -0.15, 6.4]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[2, 2.7]} />
        {wallMaterial}
      </mesh>
      {/* Baseboards */}
      {/* Front — split into two pieces so the door frame at x ≈ [-5.56,
          -3.44] (door center -4.5, DOOR_W 1.8, FRAME_TRIM_W 0.16) sits in
          a clean gap instead of being run through by the baseboard. */}
      {/* Front-left: from x=-8 to x=-5.56, width 2.44, center -6.78 */}
      <mesh position={[-6.78, -1.35, 5.95]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[2.44, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Front-right: split again around the built-in bookcase cutout at
          x [-1.5, 0.5] so the baseboard doesn't cross through the case. */}
      {/* Front-right-a: from x=-3.44 to x=-1.5, width 1.94, center -2.47 */}
      <mesh position={[-2.47, -1.35, 5.95]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[1.94, 0.3, 0.1]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Front-right-b: from x=0.5 to x=8, width 7.5, center 4.25 */}
      <mesh position={[4.25, -1.35, 5.95]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[7.5, 0.3, 0.1]} />
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

// Separate component so useVideoTexture can suspend independently
function WindowSky({ width, height, z }: { width: number; height: number; z: number }) {
  const cloudsTexture = useVideoTexture(CLOUDS_VIDEO_URL, { muted: true, loop: true, playsInline: true, crossOrigin: "anonymous" });
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={cloudsTexture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

// Dusk/night backdrop painted into a CanvasTexture — indigo-to-ember
// gradient with a scatter of stars in the upper half. Gets drawn once
// per mount; the <Sparkles> fireflies handle everything that moves.
function NightSky({ width, height, z }: { width: number; height: number; z: number }) {
  const texture = useMemo(() => {
    const w = 512;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Deep indigo overhead → plum → dying sunset ember at the horizon.
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#040312");
    grad.addColorStop(0.45, "#120d2a");
    grad.addColorStop(0.75, "#2a1330");
    grad.addColorStop(0.92, "#512026");
    grad.addColorStop(1, "#6e2c12");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars — concentrated in the top ~65% where the sky is darkest.
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.65;
      const r = Math.random() * 1.1 + 0.25;
      const a = 0.35 + Math.random() * 0.55;
      ctx.fillStyle = `rgba(255,250,220,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
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

  // Pick day or night once per page load. 50/50 — refreshes re-roll
  // so repeat visitors can stumble on the other mood.
  const isNight = useMemo(() => Math.random() < 0.5, []);

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

      {/* Sky behind the window — either the clouds video (day) or a
          dusk/night canvas with drifting firefly sparkles. Picked once
          per mount. */}
      {isNight ? (
        <>
          <NightSky width={skyW} height={skyH} z={0} />
          {/* Custom-shader fireflies drifting in the narrow slab
              between the sky backdrop (local z = 0) and the glass
              pane (local z ≈ 0.085), so they always read as being
              *outside* the window. Each particle has independent
              drift / blink cycles (see Fireflies.tsx) so they flash
              several times per drift wobble without syncing. */}
          <Fireflies
            count={16}
            scale={[skyW * 0.8, skyH * 0.8, 0.03]}
            position={[0, 0, 0.025]}
            color="#d4ff88"
          />
        </>
      ) : (
        <Suspense fallback={
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[skyW, skyH]} />
            <meshBasicMaterial color="#8aaccf" side={THREE.DoubleSide} />
          </mesh>
        }>
          <WindowSky width={skyW} height={skyH} z={0} />
        </Suspense>
      )}

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

      {/* Light pouring in from the window — bright daylight when it's
          day, a dim cool moonlight wash when it's night. */}
      <rectAreaLight
        position={[0, 0, frameDepth / 2 + 0.15]}
        rotation={[0, Math.PI, 0]}
        width={skyW}
        height={skyH}
        intensity={isNight ? 0.7 : 4}
        color={isNight ? "#7a88a8" : "#b8d4e8"}
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
  isMobile,
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

    // Render background into shared transmission buffer. Skipped on
    // mobile — the mobile path swaps MeshTransmissionMaterial out for a
    // plain MeshPhysicalMaterial, so nothing reads this buffer and the
    // full-scene render pass would be pure waste. The FBO itself is
    // still allocated so the code path stays simple.
    if (!isMobile && tapesGroupRef.current) {
      tapesGroupRef.current.visible = false;
      state.gl.setRenderTarget(transmissionFBO);
      state.gl.render(state.scene, state.camera);
      state.gl.setRenderTarget(null);
      tapesGroupRef.current.visible = true;
    }

    // Gentle idle camera sway — desktop only. On mobile we leave the
    // camera frozen so the scene can idle cooler.
    if (!isMobile) {
      const t = state.clock.elapsedTime;
      cameraGroupRef.current.rotation.y = Math.sin(t * 0.15) * 0.015;
      cameraGroupRef.current.rotation.x = Math.sin(t * 0.1) * 0.005;
    }
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

      {/* Table lamp — left side, warm and close. castShadow is dropped
          on mobile; the whole shadowmap subsystem is disabled at the
          Canvas level there anyway, but no sense rendering depth
          targets for a light that can't cast. */}
      <pointLight
        position={[-2.5, 0.8, 0.5]}
        intensity={6}
        color="#f5d0a0"
        distance={8}
        decay={2}
        castShadow={!isMobile}
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
              bodyStyleIndex={TAPE_BODY_STYLES[i % TAPE_BODY_STYLES.length]}
              labelVideoUrl={track.labelVideoUrl}
              isMobile={isMobile}
            />
          ))}
        </group>
      </group>

      {/* String lights across the back wall */}
      <StringLights />

      {/* Window */}
      <Window />

      {/* Guitar amp in the corner near the window */}
      <GuitarAmp position={[6.2, -0.8, -4.3]} rotation={[0, -Math.PI / 3.5, 0]} />

      {/* Scandinavian tripod floor lamp in the front-right corner — diagonally
          opposite where it used to live. Easy to remove — just delete this
          line and the ./FloorLamp import above. */}
      <FloorLamp position={[6.5, -1.5, 4.5]} rotation={[0, -Math.PI * 0.75, 0]} />

      {/* Coiled tweed guitar cable resting on the floor near the amp */}
      <GuitarCable position={[4.2, -1.49, -4.9]} rotation={[0, 0.4, 0]} />

      {/* SM58-style stage microphone laying on the floor between the
          amp and the coiled cable. Y = floor (-1.5) + handle radius
          (0.032) so the side of the cylindrical body just touches
          the floor. */}
      <Microphone
        position={[5.1, -1.452, -4.2]}
        rotation={[0, 1.15, 0]}
      />

      {/* Aged Polaroid of the band sitting on the table */}
      <Polaroid
        photoUrl="/images/band.png"
        position={[3.3, -0.437, 1.9]}
        rotation={[0, 0.25, 0]}
      />

      {/* Second Polaroid — IMG_9685, slightly overlapping the first so
          they read as a casual pair tossed onto the table. Bumped up
          0.005 in y so it rests on top of the first one where they cross. */}
      <Polaroid
        photoUrl="/images/IMG_9685.jpeg"
        position={[2.75, -0.432, 2.25]}
        rotation={[0, -0.45, 0]}
      />

      {/* Diner-style coffee mug in the back-left corner of the table with
          a coffee ring stain next to it. y=-0.44 is exactly the top surface
          of the tabletop, so the mug's flat cylindrical bottom sits flush. */}
      <CoffeeMug position={[-4.0, -0.44, -2.3]} rotation={[0, 0.9, 0]} />

      {/* Yellow post-it with handwritten to-do list */}
      <PostItNote
        position={[-3.2, -0.437, 2.45]}
        rotation={[0, 0.32, 0]}
      />

      {/* Click pen resting next to the post-it */}
      <Pen position={[-2.5, -0.415, 2.25]} rotation={[0, -0.45, 0]} />

      {/* Little pile of 3 guitar picks on the table. Sits at the tabletop
          surface (y=-0.44); easy to remove by deleting this line and the
          ./GuitarPicks import above. */}
      <GuitarPicks position={[-0.7, -0.44, 2.55]} rotation={[0, 0.3, 0]} />

      {/* Die-cut "Homedays" vinyl sticker on the table — wordmark in the
          band's Theseasons font, like a printed test sticker the band
          left lying around. Lays flat in the back-right corner of the
          desk. */}
      <VinylSticker position={[3.8, -0.435, -2.35]} rotation={-0.22} />

      {/* Typewriter page with Homedays blurb */}
      <NotebookPaper
        text={"The submerged bubble-sizzle of elephant ear dough hitting the deep fryer. The unfiltered delight of being snowed in with no end in sight. The yearning in your gut to pull your own bed's comforter to your chin. You remember when it all felt lighter, before the world started swinging and never really stopped.\n\nHomedays makes music for that ache. Palm-muted crunch giving way to choruses that won't leave your head. For anyone still here, still standing, still trying to hold onto something soft before it's gone."}
        position={[2.1, -0.437, 2.0]}
        rotation={[0, -0.18, 0]}
      />

      {/* Dust motes — disabled for now */}

      {/* Six-panel white door on the FRONT wall, sitting between the center
          and the front-left corner. Rotated π so the casing and slab face
          into the room. Easy to remove — delete this line and the
          ./DoorWithFrame import above. */}
      <DoorWithFrame position={[-4.5, -1.5, 5.95]} rotation={[0, Math.PI, 0]} />

      {/* Built-in bookcase on the FRONT wall, tucked between the door
          (left of it) and the floor lamp (far right of it). Bottom of
          the case sits on the floor at y=-1.5. Easy to remove: delete
          this line and the ./Bookcase import above. */}
      <Bookcase position={[-0.5, -0.15, 6.075]} />

      {/* Spring-loaded baseboard doorstop on the LEFT wall near the
          front-left corner — close to the door so it could (in theory)
          stop the door from swinging into this wall. Click it to flick
          the spring and watch it boing. */}
      <DoorStopper
        position={[-7.9, -1.3, 4.3]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Youth Pallet poster on back wall */}
      <Image
        url="/images/Youth Pallet.JPG"
        scale={[1.8, 2.3]}
        position={[-3, 1.8, -5.94]}
        toneMapped
        color="#888888"
      />

      {/* Homedays Musica poster on back wall */}
      <Image
        url="/images/HOMEDAYS_MUSICA_1.3.26.jpg"
        scale={[1.8, 2.3]}
        position={[3, 1.8, -5.94]}
        toneMapped
        color="#888888"
      />

      {/* Floating shelf on the left wall — holds a pothos, a globe lamp,
          and a couple of leaning vinyl records. Easy to remove: delete
          this line and the ./FloatingShelf import above. To remove or
          rearrange the items on the shelf, edit FloatingShelf.tsx. */}
      <FloatingShelf
        position={[-7.94, 1.8, -2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={2}
      />

      {/* Tabletop surface */}
      <Tabletop />

      {/* Area rug under the table — sits just above the hardwood floor */}
      <Rug position={[0, -1.49, 0.05]} rotation={0} />

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
        autoRotate={!isMobile}
        autoRotateSpeed={0.3}
      />

      {/* Post-processing — desktop only. EffectComposer adds several
          full-screen passes (bloom mipmap blur, noise, vignette, DoF
          with bokeh); on mobile that's easily the hottest thing on the
          GPU, and dropping it is the single biggest perf win for phones. */}
      {!isMobile && (
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
      )}
    </>
  );
}
