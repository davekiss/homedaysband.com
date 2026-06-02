import type { PitchConfig } from "../pitch-types";
import sparta from "./sparta";

const pitches: Record<string, PitchConfig> = {
  [sparta.slug]: sparta,
};

export default pitches;
