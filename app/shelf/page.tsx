import type { Metadata } from "next";
import { decodeShelf, shelfSummary } from "@/lib/shelf";
import ShelfPage from "./ShelfPage";

type SearchParams = Promise<{ c?: string | string[] }>;

const paramOf = (c?: string | string[]) => (Array.isArray(c) ? c[0] : c) ?? "";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const c = paramOf((await searchParams).c);
  const cards = decodeShelf(c);
  const title = cards.length ? `${shelfSummary(cards.length)} | Homedays` : "Your shelf | Homedays";
  const description = cards.length
    ? `Homedays song cards found so far: ${cards.map((x) => x.slug).join(", ")}.`
    : "The Homedays song cards you've tapped.";
  const image = `/shelf/og${c ? `?c=${encodeURIComponent(c)}` : ""}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const c = paramOf((await searchParams).c);
  return <ShelfPage fromUrl={decodeShelf(c)} />;
}
