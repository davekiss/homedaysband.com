"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { PitchTrack } from "@/data/default-tracks";

import "@videojs/react/audio/skin.css";
import { createPlayer, TimeSlider, PlayButton, Time, MuteButton, VolumeSlider } from "@videojs/react";
import { audioFeatures, Audio } from "@videojs/react/audio";
import {
  PlayIcon,
  PauseIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from "@videojs/react/icons";

const Player = createPlayer({ features: audioFeatures });

type Props = {
  tracks: PitchTrack[];
  bandSlug: string;
};

export default function DockedPlayer({ tracks, bandSlug }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const track = tracks[currentIndex];

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % tracks.length);
  }, [tracks.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Player.Provider>
        <Player.Container className="docked-player-container">
          <Audio src={track.src} />

          <div className="bg-white border-t border-[#2B44FF]/15 px-4 sm:px-6 py-4">
            <div className="max-w-[1200px] mx-auto flex items-center gap-4 sm:gap-6">
              {/* Album art placeholder */}
              <div className="hidden sm:block w-14 h-14 bg-[#2B44FF]/8 rounded-sm flex-shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-[#2B44FF]/25 text-[10px] tracking-widest uppercase font-bold">
                  HD
                </div>
              </div>

              {/* Track info */}
              <div className="w-[110px] sm:w-[160px] flex-shrink-0">
                <p className="text-[13px] sm:text-[15px] font-bold text-[#2B44FF] truncate leading-tight">
                  {track.title}
                </p>
                <p className="text-[11px] sm:text-[13px] text-[#2B44FF]/90 truncate">
                  Homedays
                </p>
              </div>

              {/* Time / Slider / Time */}
              <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                <Time.Value
                  type="current"
                  className="text-[13px] text-[#2B44FF]/90 tabular-nums w-[40px] text-right flex-shrink-0"
                />
                <TimeSlider.Root className="pitch-slider flex-1">
                  <TimeSlider.Track className="pitch-slider-track">
                    <TimeSlider.Fill className="pitch-slider-fill" />
                  </TimeSlider.Track>
                  <TimeSlider.Thumb className="pitch-slider-thumb" />
                </TimeSlider.Root>
                <Time.Value
                  type="duration"
                  className="text-[13px] text-[#2B44FF]/90 tabular-nums w-[40px] flex-shrink-0"
                />
              </div>

              {/* Transport controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={prev}
                  className="w-8 h-8 flex items-center justify-center text-[#2B44FF]/85 hover:text-[#2B44FF] transition-colors"
                  aria-label="Previous track"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
                <PlayButton
                  className="w-11 h-11 flex items-center justify-center bg-[#2B44FF] text-white rounded-full hover:bg-[#2B44FF]/85 transition-colors"
                  render={(props, state) => (
                    <button {...props}>
                      {state.paused ? (
                        <PlayIcon className="w-5 h-5" />
                      ) : (
                        <PauseIcon className="w-5 h-5" />
                      )}
                    </button>
                  )}
                />
                <button
                  onClick={next}
                  className="w-8 h-8 flex items-center justify-center text-[#2B44FF]/85 hover:text-[#2B44FF] transition-colors"
                  aria-label="Next track"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 w-[100px]">
                <MuteButton
                  className="w-6 h-6 flex items-center justify-center text-[#2B44FF]/90 hover:text-[#2B44FF] transition-colors"
                  render={(props, state) => (
                    <button {...props}>
                      {state.muted ? (
                        <VolumeOffIcon className="w-4 h-4" />
                      ) : (
                        <VolumeHighIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                />
                <VolumeSlider.Root className="pitch-slider pitch-volume-slider">
                  <VolumeSlider.Track className="pitch-slider-track">
                    <VolumeSlider.Fill className="pitch-slider-fill" />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="pitch-slider-thumb" />
                </VolumeSlider.Root>
              </div>
            </div>
          </div>

          <PlayTracker trackTitle={track.title} bandSlug={bandSlug} />
        </Player.Container>
      </Player.Provider>
    </div>
  );
}

function PlayTracker({ trackTitle, bandSlug }: { trackTitle: string; bandSlug: string }) {
  const paused = Player.usePlayer((s) => s.paused);
  const playStartRef = useRef<number | null>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    sentRef.current = false;
    playStartRef.current = null;
  }, [trackTitle]);

  useEffect(() => {
    const lsKey = `pitch-play:${bandSlug}:${trackTitle}`;
    if (localStorage.getItem(lsKey)) {
      sentRef.current = true;
    }
  }, [bandSlug, trackTitle]);

  useEffect(() => {
    if (sentRef.current) return;

    if (paused) {
      playStartRef.current = null;
      return;
    }

    playStartRef.current = Date.now();

    const interval = setInterval(() => {
      if (sentRef.current || playStartRef.current === null) return;

      const elapsed = (Date.now() - playStartRef.current) / 1000;
      if (elapsed >= 15) {
        sentRef.current = true;
        playStartRef.current = null;
        const lsKey = `pitch-play:${bandSlug}:${trackTitle}`;
        localStorage.setItem(lsKey, new Date().toISOString());

        fetch("/api/track-play", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bandSlug, trackTitle }),
        }).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, bandSlug, trackTitle]);

  return null;
}
