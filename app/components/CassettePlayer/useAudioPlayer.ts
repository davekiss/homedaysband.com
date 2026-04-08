"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { playClickSound } from "./TransportControls";

export type Track = {
  title: string;
  src: string;
  // Optional override for the dreamy video that plays over this tape's
  // label while it's inserted and playing. When omitted, the tape falls
  // back to the shared `/videos/clouds.mp4` loop. Use a direct video URL
  // (MP4 works everywhere; Mux static MP4 renditions are one easy source).
  labelVideoUrl?: string;
};

export type PlayerState = "idle" | "playing" | "paused" | "rewinding" | "fast-forwarding";

// ---------------------------------------------------------------------------
// Tape warble / lo-fi effect
// Flip TAPE_EFFECT_ENABLED to false to bypass the entire chain cleanly.
// Tweak the constants below to taste — all in one place so this is easy to rip
// out if it doesn't sound right.
// ---------------------------------------------------------------------------
const TAPE_EFFECT_ENABLED = true;

// Wow = slow pitch drift; flutter = faster subtle warble. Depths
// kept modest so sustained notes don't read as intentional vibrato —
// the ~6 Hz flutter sits right in vibrato range and gets audible
// fast as depth increases.
const WOW_RATE_HZ = 0.55;
const WOW_DEPTH_SEC = 0.0012;
const FLUTTER_RATE_HZ = 6.2;
const FLUTTER_DEPTH_SEC = 0.00012;

// Tone shaping
const TAPE_LOWPASS_HZ = 7500;
const TAPE_HISS_LEVEL = 0.01; // 0..1
const TAPE_SATURATION = 0.18; // 0..1, amount of soft clip

type TapeChain = {
  input: GainNode;
  output: GainNode;
  cleanup: () => void;
  // Ramp the tape hiss in/out so it only hums while music is actually
  // playing. Without this the looping noise source keeps hissing even
  // when the player is paused/idle, which sounds broken.
  setHissActive: (active: boolean) => void;
};

function makeSaturationCurve(amount: number) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 30;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

function createTapeChain(ctx: AudioContext): TapeChain {
  // Input / output busses so the caller can connect the whole chain as one unit
  const input = ctx.createGain();
  const output = ctx.createGain();

  // 1) Tone rolloff — old tape loses the high end
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = TAPE_LOWPASS_HZ;
  lowpass.Q.value = 0.7;

  // 2) Soft-clip saturation for tape compression feel
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeSaturationCurve(TAPE_SATURATION);
  shaper.oversample = "2x";

  // 3) Modulated delay provides the pitch wobble (wow + flutter).
  //    A tiny base delayTime lets the LFO modulate both directions.
  const delay = ctx.createDelay(0.05);
  delay.delayTime.value = 0.005;

  const wowLfo = ctx.createOscillator();
  wowLfo.frequency.value = WOW_RATE_HZ;
  const wowGain = ctx.createGain();
  wowGain.gain.value = WOW_DEPTH_SEC;
  wowLfo.connect(wowGain).connect(delay.delayTime);
  wowLfo.start();

  const flutterLfo = ctx.createOscillator();
  flutterLfo.frequency.value = FLUTTER_RATE_HZ;
  const flutterGain = ctx.createGain();
  flutterGain.gain.value = FLUTTER_DEPTH_SEC;
  flutterLfo.connect(flutterGain).connect(delay.delayTime);
  flutterLfo.start();

  // 4) Tape hiss — looping white noise, highpassed so it sits as "air"
  const noiseLen = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1500;
  const noiseGain = ctx.createGain();
  // Start silent — toggled on/off by setHissActive based on player state.
  noiseGain.gain.value = 0;
  noise.connect(noiseFilter).connect(noiseGain).connect(output);
  noise.start();

  const setHissActive = (active: boolean) => {
    const now = ctx.currentTime;
    const target = active ? TAPE_HISS_LEVEL : 0;
    noiseGain.gain.cancelScheduledValues(now);
    noiseGain.gain.setValueAtTime(noiseGain.gain.value, now);
    noiseGain.gain.linearRampToValueAtTime(target, now + 0.05);
  };

  // Main signal chain: input → lowpass → shaper → delay → output
  input.connect(lowpass);
  lowpass.connect(shaper);
  shaper.connect(delay);
  delay.connect(output);

  // Tear down everything this chain owns. Critical for HMR / unmount —
  // otherwise the looping noise source keeps playing into ctx.destination
  // and stacks every time the module hot-reloads.
  const cleanup = () => {
    try { wowLfo.stop(); } catch {}
    try { flutterLfo.stop(); } catch {}
    try { noise.stop(); } catch {}
    wowLfo.disconnect();
    wowGain.disconnect();
    flutterLfo.disconnect();
    flutterGain.disconnect();
    noise.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
    lowpass.disconnect();
    shaper.disconnect();
    delay.disconnect();
    input.disconnect();
    output.disconnect();
  };

  return { input, output, cleanup, setHissActive };
}

export function useAudioPlayer(tracks: Track[]) {
  const [state, setState] = useState<PlayerState>("idle");
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(3); // 0-12 scale
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const tapeChainRef = useRef<TapeChain | null>(null);
  const rafRef = useRef<number>(0);
  // Pending delayed-autoplay timer (used so the song can wait for the
  // cassette's insert animation to finish before playback starts).
  const playTimeoutRef = useRef<number | null>(null);

  // Tear down the entire audio graph on unmount (and on HMR, since React
  // unmounts the component before remounting). Without this, the tape chain's
  // looping noise source keeps playing into the old AudioContext and a fresh
  // one is created on remount, so the hiss compounds every reload.
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current !== null) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }
      if (tapeChainRef.current) {
        tapeChainRef.current.cleanup();
        tapeChainRef.current = null;
      }
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }
      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch {}
        analyserRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;

      if (TAPE_EFFECT_ENABLED) {
        tapeChainRef.current = createTapeChain(ctx);
        tapeChainRef.current.output.connect(analyserRef.current);
      }

      analyserRef.current.connect(ctx.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const loadTrack = useCallback(
    (index: number, autoplay = false, autoplayDelayMs = 0) => {
      ensureAudioContext();
      // Cancel any previously scheduled delayed-play from a prior click so
      // quick tape swaps don't stack timers that fire on the wrong track.
      if (playTimeoutRef.current !== null) {
        clearTimeout(playTimeoutRef.current);
        playTimeoutRef.current = null;
      }
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
          if (TAPE_EFFECT_ENABLED && tapeChainRef.current) {
            sourceRef.current.connect(tapeChainRef.current.input);
          } else {
            sourceRef.current.connect(analyserRef.current);
          }
        }
      }
      audioRef.current.src = tracks[index].src;
      audioRef.current.volume = volume / 12;
      audioRef.current.load();
      setCurrentTrackIndex(index);
      setProgress(0);
      // Reset to idle while the tape is physically traveling into the deck
      // — we'll flip to "playing" when the delayed timer fires.
      setState("idle");
      if (autoplay) {
        const startPlayback = () => {
          playTimeoutRef.current = null;
          if (!audioRef.current) return;
          // Play the mechanical "click" exactly as playback begins so it
          // lines up with the tape clicking into the deck (matching the
          // sound the transport play button makes when pressed manually).
          playClickSound();
          // HTMLAudioElement.play() will wait until the source is loaded
          // enough to begin playback, so we can call it directly.
          audioRef.current.play().catch(() => {});
          setState("playing");
        };
        if (autoplayDelayMs > 0) {
          playTimeoutRef.current = window.setTimeout(
            startPlayback,
            autoplayDelayMs
          );
        } else {
          startPlayback();
        }
      }
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
    if (playTimeoutRef.current !== null) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState("idle");
    setProgress(0);
  }, []);

  const eject = useCallback(() => {
    if (playTimeoutRef.current !== null) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
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

  // Toggle tape hiss to follow the player state — only audible when the
  // music is actually moving. "rewinding" counts as not-playing since
  // rewind pauses the audio element.
  useEffect(() => {
    const active = state === "playing" || state === "fast-forwarding";
    tapeChainRef.current?.setHissActive(active);
  }, [state]);

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
