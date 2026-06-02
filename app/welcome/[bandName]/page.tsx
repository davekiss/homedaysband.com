import { notFound } from "next/navigation";
import type { Metadata } from "next";
import pitches from "@/data/pitches";
import venues from "@/data/venues";
import PitchPage from "@/app/components/PitchPage/PitchPage";

type Props = {
  params: Promise<{ bandName: string }>;
};

export async function generateStaticParams() {
  return Object.keys(pitches).map((slug) => ({ bandName: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bandName } = await params;
  const pitch = pitches[bandName];
  if (!pitch) return {};

  const venue = venues[pitch.venueKey];
  const date = new Date(pitch.showDate + "T12:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const title = `For ${pitch.bandName} — ${venue?.name ?? "Cleveland"}, ${formatted}`;
  const description = `A Cleveland cheat sheet for ${pitch.bandName}'s show at ${venue?.name ?? "Cleveland"} on ${formatted}. Made by Homedays.`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function WelcomePage({ params }: Props) {
  const { bandName } = await params;
  const pitch = pitches[bandName];
  if (!pitch) notFound();

  const venue = venues[pitch.venueKey];
  if (!venue) notFound();

  return <PitchPage pitch={pitch} venue={venue} />;
}
