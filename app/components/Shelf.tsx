"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cardBySlot, slotLabel, TOTAL_SLOTS } from "@/data/cards";
import { encodeShelf, shelfSummary, type CollectedCard } from "@/lib/shelf";

type Props = {
  cards: CollectedCard[];
  // "inline" sits on the song page's table; "full" is the /shelf page.
  variant: "inline" | "full";
  // Whether the share button is offered (needs at least one card).
  share?: boolean;
};

export default function Shelf({ cards, variant, share = false }: Props) {
  const filled = new Map(cards.map((c) => [c.slot, c]));
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1);
  const param = encodeShelf(cards);
  const shelfHref = param ? `/shelf?c=${param}` : "/shelf";

  return (
    <section className="shelf" data-variant={variant} aria-label="Your shelf">
      <div className="shelf-head">
        <h2>{variant === "full" ? "Your shelf" : "On your shelf"}</h2>
        <p className="shelf-count">{shelfSummary(cards.length)}</p>
      </div>

      <div className="shelf-board" role="list">
        {slots.map((slot) => {
          const card = cardBySlot(slot);
          const held = filled.get(slot);
          return (
            <div key={slot} className="shelf-slot" data-held={!!held} role="listitem">
              {held && card ? (
                <Link href={`/c/${card.slug}/${held.no}`} className="shelf-card" aria-label={`${card.title}, card ${slotLabel(slot)}, no. ${held.no}`}>
                  <span className="shelf-card-art">
                    <Image src={card.art} alt="" width={400} height={400} sizes="120px" />
                  </span>
                  <span className="shelf-card-line">
                    <span>{slotLabel(slot)}</span>
                    <span>No. {held.no}</span>
                  </span>
                </Link>
              ) : (
                <span className="shelf-card shelf-card-empty" aria-label={`Card ${slotLabel(slot)}, not yet found`}>
                  <span className="shelf-card-art" />
                  <span className="shelf-card-line">
                    <span>{slotLabel(slot)}</span>
                  </span>
                </span>
              )}
            </div>
          );
        })}
        <span className="shelf-plank shelf-plank-1" aria-hidden />
        <span className="shelf-plank shelf-plank-2" aria-hidden />
        <span className="shelf-plank shelf-plank-3" aria-hidden />
      </div>

      <div className="shelf-foot">
        {share && cards.length > 0 && <ShareButton cards={cards} />}
        {variant === "inline" ? (
          <Link href={shelfHref} className="shelf-link">
            Open your shelf
          </Link>
        ) : (
          <Link href="/" className="shelf-link">
            homedaysband.com
          </Link>
        )}
      </div>
    </section>
  );
}

// Image first: on a phone the share sheet takes the PNG straight into
// Instagram Stories or Messages. Where files can't be shared, the link
// goes instead (and unfurls to the same image). Last resort: copy.
function ShareButton({ cards }: { cards: CollectedCard[] }) {
  const [state, setState] = useState<"idle" | "busy" | "copied" | "shared">("idle");
  const param = encodeShelf(cards);
  const summary = shelfSummary(cards.length);

  const onShare = async () => {
    if (state === "busy") return;
    setState("busy");
    const url = `${location.origin}/shelf?c=${param}`;
    const text = `${summary} — Homedays`;
    try {
      if (typeof navigator.share === "function") {
        try {
          const res = await fetch(`/shelf/og?c=${param}&format=story`);
          const blob = await res.blob();
          const file = new File([blob], "homedays-shelf.png", { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "Homedays", text: `${text}\n${url}` });
            setState("shared");
            return;
          }
        } catch (e) {
          // Cancelled the sheet: stop here. Anything else: try the link share.
          if ((e as DOMException)?.name === "AbortError") {
            setState("idle");
            return;
          }
        }
        try {
          await navigator.share({ title: "Homedays", text, url });
          setState("shared");
          return;
        } catch (e) {
          // Cancelled: back to idle. Not allowed / unsupported: copy instead.
          if ((e as DOMException)?.name === "AbortError") {
            setState("idle");
            return;
          }
        }
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("idle");
    }
  };

  return (
    <button type="button" className="shelf-share" onClick={onShare} disabled={state === "busy"}>
      {state === "copied" ? "Link copied" : state === "shared" ? "Shared" : "Share your shelf"}
    </button>
  );
}
