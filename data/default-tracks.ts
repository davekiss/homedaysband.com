import { muxStatic } from "@/app/components/CassettePlayer/mux";

export type PitchTrack = {
  title: string;
  src: string;
  description: string;
};

const defaultTracks: PitchTrack[] = [
  {
    title: "Awry",
    src: muxStatic("XiZ6YMTp400XdlSH8T2qgJPxs6L4Ak00MBvh6901qThcW00", "audio.m4a"),
    description: "",
  },
  {
    title: "Cinematheque",
    src: muxStatic("Z7pH36DEdHsXgqWeQZPDif00c4JfK51db4WL02Gr1kjms", "audio.m4a"),
    description: "A slow-burning anthem about distance and belonging",
  },
  {
    title: "Reckless",
    src: muxStatic("AGV9nYRxIxPWCT4UbLbSt8Evki9nnOS5L01r01it3pqqA", "audio.m4a"),
    description: "Chant-along chorus, driving drums, and a message of differing opinions",
  },
  {
    title: "Fracture",
    src: muxStatic("o1GXRne9hRVW4elA00j01dGB01OlUROHB01LT7ibilZGFSA", "audio.m4a"),
    description: "",
  },
];

export default defaultTracks;
