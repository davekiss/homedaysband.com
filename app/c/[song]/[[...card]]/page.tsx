import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { songBySlug } from "@/data/songs";
import { SERIAL } from "@/lib/shelf";
import JCard from "../JCard";

// /c/awry            — the public song page
// /c/awry/017        — the same page, opened from physical card no. 017,
//                      which puts the card on the visitor's shelf
type Params = Promise<{ song: string; card?: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const song = songBySlug((await params).song);
  if (!song) return {};
  const title = `${song.title} | ${song.artist}`;
  const description = `Listen to "${song.title}", the single from ${song.artist}. Just a band from Cleveland, Ohio.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "music.song",
      images: [{ url: song.artwork, width: 1600, height: 1600, alt: `${song.title} — single artwork by ${song.artist}` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [song.artwork] },
  };
}

export default async function SongPage({ params }: { params: Params }) {
  const { song: slug, card } = await params;
  const song = songBySlug(slug);
  if (!song) notFound();
  if (card && (card.length !== 1 || !SERIAL.test(card[0]))) notFound();
  return <JCard song={song} cardNumber={card?.[0]} />;
}
