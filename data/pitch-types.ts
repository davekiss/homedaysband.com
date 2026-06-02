export type PitchConfig = {
  bandName: string;
  slug: string;
  venueKey: string;
  showDate: string; // ISO date, e.g. "2026-09-24"
  note: string;
  logo?: string;
  trackOverrides?: string[]; // titles to pick from the full track catalog; defaults to top 3
};
