"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import Scene from "./Scene";
import NowPlaying from "./NowPlaying";
import { useAudioPlayer, type Track } from "./useAudioPlayer";
import { useIsMobile } from "./useIsMobile";
import { muxStatic } from "./mux";

// Lives inside the Canvas's Suspense boundary so it only mounts AFTER
// every Suspense-loaded asset (useTexture/useVideoTexture) has resolved.
// We then wait a handful of useFrame ticks so shaders have a chance to
// compile and the FBO-driven transmission materials can do their first
// render pass before we signal "the scene is actually visible now".
function SceneReadySignal({ onReady }: { onReady: () => void }) {
  const firedRef = useRef(false);
  const framesRemainingRef = useRef(3);
  useFrame(() => {
    if (firedRef.current) return;
    framesRemainingRef.current -= 1;
    if (framesRemainingRef.current <= 0) {
      firedRef.current = true;
      onReady();
    }
  });
  return null;
}

// Subtle centered loading bar. Stays visible until the in-Canvas scene
// has actually rendered a couple of frames — otherwise we fade out too
// early and the user sees the overlay disappear onto a black screen
// before the scene flicks in.
//
// The bar fill is driven by a monotonically-increasing max of
// useProgress() (which otherwise snaps backward every time a new wave
// of assets starts loading through the DefaultLoadingManager, causing
// the bar to visibly rewind from 100 → 80 → 100 several times). We
// also reserve the last 10% of the fill for the "waiting for the first
// frame" phase so the bar only actually reaches 100% exactly once,
// right when the scene is truly visible.
function LoadingOverlay({ sceneReady }: { sceneReady: boolean }) {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(true);
  const [maxProgress, setMaxProgress] = useState(0);

  useEffect(() => {
    setMaxProgress((prev) => (progress > prev ? progress : prev));
  }, [progress]);

  const done = sceneReady;
  // 0..90 while assets trickle in, jumps to 100 once the scene renders.
  const barPct = done ? 100 : Math.min(90, maxProgress * 0.9);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setMounted(false), 600);
    return () => window.clearTimeout(t);
  }, [done]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-500"
      style={{
        background: "linear-gradient(180deg, #1a1614 0%, #0f0e0c 100%)",
        opacity: done ? 0 : 1,
      }}
    >
      <div className="w-40 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white/40 transition-[width] duration-300 ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}

const TRACKS: Track[] = [
  {
    title: "Awry",
    src: muxStatic("XiZ6YMTp400XdlSH8T2qgJPxs6L4Ak00MBvh6901qThcW00", "audio.m4a"),
  },
  {
    title: "Fracture",
    src: muxStatic("o1GXRne9hRVW4elA00j01dGB01OlUROHB01LT7ibilZGFSA", "audio.m4a"),
  },
  {
    title: "Calico",
    src: muxStatic("NgXZZbxvWQtJQIhUiF702RZ1u02WqOlJSekmBnb01bl02mE", "audio.m4a"),
  },
  {
    title: "Cinematheque",
    src: muxStatic("Z7pH36DEdHsXgqWeQZPDif00c4JfK51db4WL02Gr1kjms", "audio.m4a"),
  },
  {
    title: "High Fly Ball",
    src: muxStatic("cQqnLBsz8qPa74TkM00m7V8pHojL3tL9YIey00OkkB00cA", "audio.m4a"),
  },
  {
    title: "I Love a Rainbow",
    src: muxStatic("kshuRlfVYiG8JXyHJaDdOMN00hxdmWxXg6hIJED2y02UI", "audio.m4a"),
  },
  {
    title: "Imposter",
    src: muxStatic("CvYHNMUpz202GMjs4zMPzB5NwAhVY9WmbkeSWREQG6UA", "audio.m4a"),
  },
  {
    title: "Movement",
    // Audio served from Mux as a static m4a rendition.
    src: muxStatic("mbeJnNzlVoRSXDKfXTM6IQOaQSm00MZ8aKr99uGdREHE", "audio.m4a"),
  },
  {
    title: "Overflow",
    src: muxStatic("tPW4myd29xnz0111n2VG733DDholL501gq5YK2uqDDCBc", "audio.m4a"),
  },
  {
    title: "Reckless",
    src: muxStatic("AGV9nYRxIxPWCT4UbLbSt8Evki9nnOS5L01r01it3pqqA", "audio.m4a"),
  },
  {
    title: "Spiral",
    src: muxStatic("EHC9njwLuD1BrdvgbC02X5pjUYIbG3KJDs24gkOXYnks", "audio.m4a"),
  },
  {
    title: "Pastures",
    src: muxStatic("b7hzgHMQTJE8mbSyyKmbXp3vo3vkrSY01UT4GPfEY7mU", "audio.m4a"),
  },
];

export default function CassettePlayer() {
  const player = useAudioPlayer(TRACKS);
  const [sceneReady, setSceneReady] = useState(false);
  // Null until matchMedia has resolved on the client; we hold off
  // mounting the r3f Canvas until we know, because `shadows` and `dpr`
  // are effectively initial-only props on the WebGL renderer.
  const isMobile = useIsMobile();

  // Wait for the cassette tape's insert animation to finish (~833ms in
  // CassetteTape.tsx) before actually starting playback, so the song
  // begins right as the tape clicks into the deck rather than mid-flight.
  const handleSelectTrack = (index: number) => {
    player.loadTrack(index, true, 850);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {isMobile !== null && (
        <Canvas
          // Desktop: rely on the browser default DPR. Mobile: clamp to
          // 1.5 max — phones ship at DPR 2–3 which quadruples the pixel
          // count vs. DPR 1 and is the single biggest perf lever.
          dpr={isMobile ? [1, 1.5] : undefined}
          // Shadow maps are expensive on mobile GPUs. Every castShadow
          // mesh renders into an extra depth target per shadow-casting
          // light per frame — we turn the whole subsystem off on phones.
          // On desktop, use "percentage" (PCFShadowMap) — r3f's default
          // `shadows` type is PCFSoftShadowMap, which three.js has
          // deprecated and spams a console warning every frame.
          shadows={isMobile ? false : "percentage"}
          camera={{
            position: [0, 2.2, 2.4],
            fov: 40,
            near: 0.1,
            far: 50,
          }}
          gl={{
            antialias: true,
            toneMapping: 1, // LinearToneMapping
            toneMappingExposure: 1.6,
          }}
          style={{
            cursor: "pointer",
            background: "linear-gradient(180deg, #1a1614 0%, #0f0e0c 100%)",
          }}
        >
          <Suspense fallback={null}>
            <Scene
              tracks={TRACKS}
              playerState={player.state}
              currentTrackIndex={player.currentTrackIndex}
              progress={player.progress}
              duration={player.duration}
              onSelectTrack={handleSelectTrack}
              onPlay={player.play}
              onPause={player.pause}
              onStop={player.stop}
              onRewind={player.rewind}
              onFastForward={player.fastForward}
              onEject={player.eject}
              onStopFastAction={player.stopFastAction}
              getFrequencyData={player.getFrequencyData}
              volume={player.volume}
              onVolumeChange={player.setVolume}
              isMobile={isMobile}
            />
            <SceneReadySignal onReady={() => setSceneReady(true)} />
          </Suspense>
        </Canvas>
      )}
      {/* Film grain overlay — skipped on mobile, it's an always-playing
          fullscreen video doing mix-blend-overlay which isn't cheap. */}
      {!isMobile && (
        <video
          src={muxStatic("02Sxge8AxIUTz5tvGKL2WikSdU4IVNsaNhUcC448h5lg", "highest.mp4")}
          crossOrigin="anonymous"
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-[1] mix-blend-overlay opacity-100"
        />
      )}
      <div
        className="fixed bottom-8 left-0 right-0 z-10 transition-opacity duration-500"
        style={{ opacity: sceneReady ? 1 : 0 }}
      >
        <NowPlaying
          trackTitle={player.currentTrack?.title ?? null}
          playerState={player.state}
          progress={player.progress}
          duration={player.duration}
        />
      </div>
      <LoadingOverlay sceneReady={sceneReady} />
    </div>
  );
}
