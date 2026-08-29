// The Homedays song-card run. Every physical NFC card is one of these
// slots; a card's serial (No. 017) says which copy of the slot it is.
//
// TOTAL_SLOTS is a promise printed on every shelf as dimmed silhouettes,
// so it must equal the run the band will actually print. Only cards
// that exist are listed; unlisted slots render as empty silhouettes.

export type SongCard = {
  slot: number; // printed as "01" — the Homedays Song Card number
  slug: string; // route: /c/<slug>/<serial>
  title: string;
  art: string; // square art for shelf slots and the share image
};

export const TOTAL_SLOTS = 12;

export const cards: SongCard[] = [
  { slot: 1, slug: "awry", title: "Awry", art: "/images/awry-single-400.jpg" },
];

export const cardBySlug = (slug: string) => cards.find((c) => c.slug === slug);
export const cardBySlot = (slot: number) => cards.find((c) => c.slot === slot);
export const slotLabel = (slot: number) => String(slot).padStart(2, "0");
