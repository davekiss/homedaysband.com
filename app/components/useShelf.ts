"use client";

import { useCallback, useEffect, useState } from "react";
import { addToShelf, readShelf, writeShelf, type CollectedCard } from "@/lib/shelf";

// The visitor's shelf, kept in localStorage. `ready` flips once the
// browser has been read, so nothing shelf-related renders on the server.
export function useShelf() {
  const [cards, setCards] = useState<CollectedCard[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCards(readShelf());
    setReady(true);
  }, []);

  const add = useCallback((slug: string, no: string) => {
    setCards((prev) => {
      const next = addToShelf(prev, slug, no);
      if (next !== prev) writeShelf(next);
      return next;
    });
  }, []);

  return { cards, ready, add };
}
