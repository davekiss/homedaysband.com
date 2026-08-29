import { cardBySlot, cardBySlug, slotLabel, TOTAL_SLOTS } from "@/data/cards";

// A card someone has tapped. `no` is the serial printed on that copy.
export type CollectedCard = {
  slug: string;
  slot: number;
  no: string;
  at: string; // ISO timestamp of the first tap
};

export const SHELF_STORAGE_KEY = "homedays:shelf";
export const SERIAL = /^[A-Za-z0-9-]{1,8}$/;

// URL form: /shelf?c=01.017,04.003 — slot.serial pairs, oldest first.
// The link carries the whole shelf, so it survives a wiped localStorage
// and renders the same for whoever it is shared with.
export function encodeShelf(cards: CollectedCard[]): string {
  return [...cards]
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((c) => `${slotLabel(c.slot)}.${c.no}`)
    .join(",");
}

export function decodeShelf(param: string | null | undefined): CollectedCard[] {
  if (!param) return [];
  const out: CollectedCard[] = [];
  const seen = new Set<number>();
  for (const [i, pair] of param.split(",").entries()) {
    const m = /^(\d{1,2})\.([A-Za-z0-9-]{1,8})$/.exec(pair.trim());
    if (!m) continue;
    const slot = Number(m[1]);
    const card = cardBySlot(slot);
    if (!card || seen.has(slot)) continue;
    seen.add(slot);
    // Synthetic ordering timestamps keep encode(decode(x)) stable.
    out.push({ slug: card.slug, slot, no: m[2], at: new Date(i).toISOString() });
  }
  return out;
}

export function readShelf(): CollectedCard[] {
  try {
    const raw = localStorage.getItem(SHELF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { cards?: CollectedCard[] };
    return (parsed.cards ?? []).filter((c) => cardBySlug(c.slug) && SERIAL.test(c.no));
  } catch {
    return [];
  }
}

export function writeShelf(cards: CollectedCard[]) {
  try {
    localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify({ cards }));
  } catch {
    // Private mode or blocked storage: the page still works, the shelf just won't remember.
  }
}

// Add a tapped card. The first serial seen for a song is the one kept —
// tapping a second copy of the same card doesn't change the shelf.
export function addToShelf(cards: CollectedCard[], slug: string, no: string): CollectedCard[] {
  const card = cardBySlug(slug);
  if (!card || !SERIAL.test(no)) return cards;
  if (cards.some((c) => c.slug === slug)) return cards;
  return [...cards, { slug, slot: card.slot, no, at: new Date().toISOString() }];
}

export const shelfSummary = (count: number) => `${count} of ${TOTAL_SLOTS} cards`;
