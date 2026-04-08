"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import Scene from "./Scene";
import NowPlaying from "./NowPlaying";
import { useAudioPlayer, type Track } from "./useAudioPlayer";
import { useIsMobile } from "./useIsMobile";

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
  { title: "Awry", src: "/music/Awry (RB1).mp3" },
  { title: "Fracture", src: "/music/Fracture (RB1).mp3" },
  { title: "Calico", src: "/music/calico-v1.mp3" },
  { title: "Cinematheque", src: "/music/cinematheque.mp3" },
  { title: "High Fly Ball", src: "/music/hi-fly-ball-3.mp3" },
  { title: "I Love a Rainbow", src: "/music/i-love-a-rainbow.mp3" },
  { title: "Imposter", src: "/music/imposter-v5.mp3" },
  {
    title: "Movement",
    src: "/music/movement.mp3",
    // Mux static MP4 rendition — drives the dreamy video that plays over
    // the Movement tape's label while it's inserted in the deck.
    labelVideoUrl:
      "https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/medium.mp4",
  },
  { title: "Overflow", src: "/music/overflow-v4.mp3" },
  { title: "Reckless", src: "/music/reckless-v3.mp3" },
  { title: "Spiral", src: "/music/spiral-v1.mp3" },
  { title: "Sway", src: "/music/sway-demo-2.mp3" },
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
          shadows={!isMobile}
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
          src="/videos/grain.mp4"
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
