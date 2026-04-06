"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import NowPlaying from "./NowPlaying";
import { useAudioPlayer, type Track } from "./useAudioPlayer";

const TRACKS: Track[] = [
  { title: "Awry", src: "/music/Awry (RB1).mp3" },
  { title: "Fracture", src: "/music/Fracture (RB1).mp3" },
  { title: "Calico", src: "/music/calico-v1.mp3" },
  { title: "Cinematheque", src: "/music/cinematheque.mp3" },
  { title: "High Fly Ball", src: "/music/hi-fly-ball-3.mp3" },
  { title: "I Love a Rainbow", src: "/music/i-love-a-rainbow.mp3" },
  { title: "Imposter", src: "/music/imposter-v5.mp3" },
  { title: "Movement", src: "/music/movement.mp3" },
  { title: "Overflow", src: "/music/overflow-v4.mp3" },
  { title: "Reckless", src: "/music/reckless-v3.mp3" },
  { title: "Spiral", src: "/music/spiral-v1.mp3" },
  { title: "Sway", src: "/music/sway-demo-2.mp3" },
];

export default function CassettePlayer() {
  const player = useAudioPlayer(TRACKS);

  const handleSelectTrack = (index: number) => {
    player.loadTrack(index);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas
        shadows
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
          />
        </Suspense>
      </Canvas>
      {/* Film grain overlay */}
      <video
        src="/videos/grain.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-[1] mix-blend-overlay opacity-100"
      />
      <div className="fixed bottom-8 left-0 right-0 z-10">
        <NowPlaying
          trackTitle={player.currentTrack?.title ?? null}
          playerState={player.state}
          progress={player.progress}
          duration={player.duration}
        />
      </div>
    </div>
  );
}
