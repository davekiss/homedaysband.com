import type { Song } from "./awry";
import { awry } from "./awry";

// Song pages by slug. A song appears here when it has a page at /c/<slug>;
// it also needs an entry in data/cards.ts to count on the shelf.
export const songs: Record<string, Song> = {
  awry,
};

export const songBySlug = (slug: string): Song | undefined => songs[slug];
