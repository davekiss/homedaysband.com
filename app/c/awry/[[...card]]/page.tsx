import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { awry } from "@/data/songs/awry";
import JCard from "../JCard";

// /c/awry            — the public song page
// /c/awry/017        — the same page, opened from physical card no. 017
const CARD_NUMBER = /^[A-Za-z0-9-]{1,8}$/;

const title = "Awry | Homedays";
const description = "Listen to \"Awry\", the new single from Homedays. Just a band from Cleveland, Ohio.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "music.song",
    images: [
      {
        url: awry.artwork,
        width: 1600,
        height: 1600,
        alt: "Awry — single artwork by Homedays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [awry.artwork],
  },
};

export default async function AwryPage({ params }: { params: Promise<{ card?: string[] }> }) {
  const { card } = await params;
  if (card && (card.length !== 1 || !CARD_NUMBER.test(card[0]))) notFound();
  return <JCard song={awry} cardNumber={card?.[0]} />;
}
