"use client";

import Link from "next/link";
import Shelf from "@/app/components/Shelf";
import { useShelf } from "@/app/components/useShelf";
import type { CollectedCard } from "@/lib/shelf";
import "@/app/c/[song]/shelf.css";

// A shared link (?c=…) shows that shelf as-is. Without one, the visitor's
// own shelf comes from localStorage. Someone else's link never merges
// into yours.
export default function ShelfPage({ fromUrl }: { fromUrl: CollectedCard[] }) {
  const mine = useShelf();
  const cards = fromUrl.length ? fromUrl : mine.cards;
  const isMine = fromUrl.length === 0;

  return (
    <main className="shelf-room">
      <div className="shelf-table">
        <Link href="/" className="shelf-home">
          Homedays
        </Link>
        {(isMine ? mine.ready : true) && <Shelf cards={cards} variant="full" share={isMine} />}
        {isMine && mine.ready && mine.cards.length === 0 && (
          <p className="shelf-empty">Tap a Homedays song card with your phone and it lands here.</p>
        )}
      </div>
    </main>
  );
}
