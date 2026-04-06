"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type Track = {
  title: string;
  src: string;
};

export type PlayerState = "idle" | "playing" | "paused" | "rewinding" | "fast-forwarding";

export function useAudioPlayer(tracks: Track[]) {
  const [state, setState] = useState<PlayerState>("idle");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(7); // 0-12 scale
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const loadTrack = useCallback(
    (index: number) => {
      ensureAudioContext();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        if (audioCtxRef.current && analyserRef.current && !sourceRef.current) {
          sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyserRef.current);
        }
      }
      audioRef.current.src = tracks[index].src;
      audioRef.current.volume = volume / 12;
      audioRef.current.load();
      setCurrentTrackIndex(index);
      setProgress(0);
    },
    [tracks, ensureAudioContext, volume]
  );

  const play = useCallback(() => {
    if (!audioRef.current || currentTrackIndex === null) return;
    ensureAudioContext();
    audioRef.current.play();
    setState("playing");
  }, [currentTrackIndex, ensureAudioContext]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setState("paused");
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState("idle");
    setProgress(0);
  }, []);

  const eject = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
    setCurrentTrackIndex(null);
    setProgress(0);
    setDuration(0);
  }, []);

  const fastForward = useCallback(() => {
    if (!audioRef.current) return;
    setState("fast-forwarding");
    audioRef.current.playbackRate = 4;
    audioRef.current.play();
  }, []);

  const rewind = useCallback(() => {
    if (!audioRef.current) return;
    setState("rewinding");
    // Simulate rewind by stepping back
    const rw = () => {
      if (!audioRef.current || state !== "rewinding") return;
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 0.3);
      if (audioRef.current.currentTime <= 0) {
        setState("paused");
        return;
      }
      rafRef.current = requestAnimationFrame(rw);
    };
    audioRef.current.pause();
    rw();
  }, [state]);

  const stopFastAction = useCallback(() => {
    if (!audioRef.current) return;
    cancelAnimationFrame(rafRef.current);
    audioRef.current.playbackRate = 1;
    audioRef.current.pause();
    setState("paused");
  }, []);

  // Update progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      setState("idle");
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIndex]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(12, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped / 12;
    }
  }, []);

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return new Uint8Array(0);
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data;
  }, []);

  return {
    state,
    currentTrackIndex,
    currentTrack: currentTrackIndex !== null ? tracks[currentTrackIndex] : null,
    progress,
    duration,
    loadTrack,
    play,
    pause,
    stop,
    eject,
    fastForward,
    rewind,
    volume,
    setVolume,
    stopFastAction,
    getFrequencyData,
  };
}
