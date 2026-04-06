"use client";

import type { PlayerState } from "./useAudioPlayer";

type NowPlayingProps = {
  trackTitle: string | null;
  playerState: PlayerState;
  progress: number;
  duration: number;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NowPlaying({ trackTitle, playerState, progress, duration }: NowPlayingProps) {
  const stateLabel =
    playerState === "playing"
      ? "PLAY"
      : playerState === "paused"
        ? "PAUSE"
        : playerState === "rewinding"
          ? "REW"
          : playerState === "fast-forwarding"
            ? "FF"
            : "";

  return (
    <div className="font-mono text-xs tracking-[0.2em] uppercase text-center select-none mt-3">
      {trackTitle ? (
        <div className="space-y-1">
          <div className="text-[#c4a44a] text-sm tracking-[0.3em]">{trackTitle}</div>
          <div className="flex items-center justify-center gap-3 text-[#8a7a5a]">
            {stateLabel && (
              <span className={playerState === "playing" ? "animate-pulse" : ""}>
                {stateLabel}
              </span>
            )}
            {duration > 0 && (
              <span>
                {formatTime(progress)} / {formatTime(duration)}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[#6a5a4a]">Insert a tape to play</div>
      )}
    </div>
  );
}
