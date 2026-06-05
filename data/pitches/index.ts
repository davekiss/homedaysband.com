import type { PitchConfig } from "../pitch-types";
import edgehill from "./edgehill";
import sparta from "./sparta";

const pitches: Record<string, PitchConfig> = {
  [edgehill.slug]: edgehill,
  [sparta.slug]: sparta,
};

export default pitches;
