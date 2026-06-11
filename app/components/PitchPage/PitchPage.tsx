"use client";

import { useMemo, useEffect } from "react";
import type { PitchConfig } from "@/data/pitch-types";
import type { Venue } from "@/data/venues";
import clevelandRecs, { type Rec, type RecCategory } from "@/data/cleveland-recs";
import defaultTracks from "@/data/default-tracks";
import DockedPlayer from "./DockedPlayer";

const BLUE = "#2B44FF";

type Props = {
  pitch: PitchConfig;
  venue: Venue;
};

function formatShowDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDayOfWeek(iso: string) {
  return new Date(iso + "T12:00:00").getDay();
}

function dayName(day: number) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
}

function isShowPast(iso: string) {
  return new Date() > new Date(iso + "T23:59:59");
}

function useRecsByCategory(venueKey: string) {
  return useMemo(() => {
    const map = new Map<RecCategory, Rec[]>();
    for (const rec of clevelandRecs) {
      if (!rec.venueNotes[venueKey]) continue;
      if (!map.has(rec.category)) map.set(rec.category, []);
      map.get(rec.category)!.push(rec);
    }
    return map;
  }, [venueKey]);
}

export default function PitchPage({ pitch, venue }: Props) {
  const showDate = formatShowDate(pitch.showDate);
  const showDay = getDayOfWeek(pitch.showDate);
  const showDayName = dayName(showDay);
  const past = isShowPast(pitch.showDate);
  const recs = useRecsByCategory(pitch.venueKey);
  const tracks = defaultTracks;

  useEffect(() => {
    const lsKey = `pitch-view:${pitch.slug}`;
    if (typeof window !== "undefined" && localStorage.getItem(lsKey)) return;
    localStorage.setItem(lsKey, new Date().toISOString());
    fetch("/api/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bandSlug: pitch.slug }),
    }).catch(() => {});
  }, [pitch.slug]);

  return (
    <div className="pitch-page min-h-screen bg-white text-[#2B44FF]">
      {/* Past show banner */}
      {past && (
        <div className="bg-[#2B44FF] text-white text-center text-xs tracking-widest uppercase py-2 px-4">
          This was for {showDate} &mdash; info may be outdated
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-[#2B44FF]/15 px-6 md:px-10 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="text-sm tracking-[0.2em] uppercase font-bold">
            Homedays
          </span>
          <div className="hidden md:flex gap-8 text-[11px] tracking-[0.15em] uppercase text-[#2B44FF]/85">
            <a href="#sleep" className="hover:text-[#2B44FF] transition-colors">Sleep</a>
            <a href="#food" className="hover:text-[#2B44FF] transition-colors">Eat</a>
            <a href="#things-to-do" className="hover:text-[#2B44FF] transition-colors">Things to Do</a>
            <a href="#shop" className="hover:text-[#2B44FF] transition-colors">Gear & Entertainment</a>
            <a href="#about" className="hover:text-[#2B44FF] transition-colors">About Us</a>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Hero */}
        <header className="pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-end">
            <div>
              <p className="text-[12px] tracking-[0.25em] uppercase text-[#2B44FF]/90 mb-6">
                Homedays &middot; Cleveland, OH
              </p>
              <h1 className="text-[clamp(2.8rem,7vw,6rem)] font-bold leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
                We want
                <br />
                to open
                <br />
                for {pitch.bandName}
              </h1>
              <p className="text-[18px] md:text-[20px] leading-relaxed text-[#2B44FF]/85 mt-8 max-w-[540px]">
                {venue.name}, Cleveland. {showDate}. We&apos;re a newer band, so we&apos;ll skip the part where we oversell ourselves. Press play below, and scroll for a Cleveland cheat sheet we put together for your stop. Or just{" "}
                <a
                  href={`mailto:homedaysband@gmail.com?subject=${encodeURIComponent(`Re: Homedays opening for ${pitch.bandName} at ${venue.name}`)}`}
                  className="underline underline-offset-2 hover:text-[#2B44FF] transition-colors"
                >
                  get in touch
                </a>.
              </p>
            </div>
            <div className="w-full md:w-[480px] bg-white p-3 pb-3 rotate-[1.5deg]" style={{ boxShadow: "-0.1px 0.8px 1px hsl(0deg 0% 65% / 0.26), -0.5px 2.9px 3.6px -0.6px hsl(0deg 0% 65% / 0.3), -1.1px 6.9px 8.4px -1.3px hsl(0deg 0% 65% / 0.33), -2.6px 16px 19.6px -1.9px hsl(0deg 0% 65% / 0.37)" }}>
              <img
                src="/images/homedays-epk-photo-3.jpg"
                alt="Homedays"
                className="w-full object-contain"
              />
              <p className="text-left text-[14px] text-[#2B44FF]/85 mt-3" style={{ fontFamily: "var(--font-sans), sans-serif" }}>Homedays, tending the tomato garden, 2026</p>
            </div>
          </div>

        </header>

        {/* Note */}
        {pitch.note && (
          <section className="bg-[#2B44FF] text-white py-14 px-6 md:px-10 -mx-6 md:-mx-10">
            <div className="max-w-[700px] mx-auto">
              <p className="text-[24px] md:text-[30px] leading-relaxed text-white/90">
                {pitch.note}
              </p>
              <p className="text-[12px] tracking-[0.15em] uppercase text-white/60 mt-5">
                &mdash; Dave, Homedays
              </p>
            </div>
          </section>
        )}

        {/* Main rec grid -- row 1 */}
        <div id="sleep" className="border-t border-[#2B44FF]/15" />
        <div id="food" className="grid grid-cols-1 md:grid-cols-3 border-b md:border-x border-[#2B44FF]/15">
          {/* Sleep */}
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15">
            <SectionHeader title="Sleep" subtitle={venue.sleepSubtitle ?? "Safe overnight parking"} />
            <RecList recs={recs.get("sleep") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>

          {/* Eat */}
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15 border-t md:border-t-0">
            <SectionHeader title="Eat" subtitle={`<5min drive from ${venue.name}`} />
            <RecList recs={recs.get("food-post-show") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>

          {/* Breakfast + Coffee stacked */}
          <div className="py-10 md:px-10 border-t md:border-t-0">
            <SectionHeader title="Breakfast" subtitle="The Morning After" />
            <RecList recs={recs.get("breakfast") ?? []} venueKey={pitch.venueKey} showDay={showDay} />

            <div className="mt-10 pt-8 border-t border-dotted border-[#2B44FF]/15" style={{ marginLeft: "-2.5rem", marginRight: "-2.5rem", paddingLeft: "2.5rem", paddingRight: "2.5rem" }}>
              <SectionHeader title="Coffee" subtitle="That Doesn't Suck" />
              <RecList recs={recs.get("coffee") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
            </div>
          </div>
        </div>

        {/* Main rec grid -- row 2 */}
        <div id="things-to-do" className="grid grid-cols-1 md:grid-cols-3 border-b md:border-x border-[#2B44FF]/15">
          {/* Vegan / Vegetarian */}
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15">
            <SectionHeader title="Vegan / Vegetarian" />
            <RecList recs={recs.get("vegan") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>

          {/* Explore */}
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15 border-t md:border-t-0">
            <SectionHeader title="Kill a Few Hours" />
            <RecList recs={recs.get("explore") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>

          {/* Quiet Drinks */}
          <div className="py-10 md:px-10 border-t md:border-t-0">
            <SectionHeader title="Wind Down" />
            <RecList recs={recs.get("quiet-drinks") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>
        </div>

        {/* Gear & Entertainment */}
        <div id="shop" className="grid grid-cols-1 md:grid-cols-3 border-b md:border-x border-[#2B44FF]/15">
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15">
            <SectionHeader title="Gear" />
            <RecList recs={recs.get("gear") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>
          <div className="py-10 md:px-10 md:border-r border-[#2B44FF]/15 border-t md:border-t-0">
            <SectionHeader title="Entertainment" />
            <RecList recs={recs.get("entertainment") ?? []} venueKey={pitch.venueKey} showDay={showDay} />
          </div>
        </div>

        {/* CTA */}
        <section className="border-b border-[#2B44FF]/15 py-16 md:py-24 text-center">
          <p className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.02em] mb-8">
            Let&apos;s make it happen
          </p>
          <a
            href={`mailto:homedaysband@gmail.com?subject=${encodeURIComponent(`Re: Homedays opening for ${pitch.bandName} at ${venue.name}`)}`}
            className="inline-block bg-[#2B44FF] text-white px-10 py-4 text-[14px] tracking-[0.15em] uppercase font-semibold hover:bg-[#2B44FF]/85 transition-colors rounded-sm"
          >
            Get in touch
          </a>
          <p className="text-[13px] text-[#2B44FF]/90 mt-5">
            homedaysband@gmail.com
          </p>
        </section>

        {/* About Us */}
        <section id="about" className="border-b border-[#2B44FF]/15 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[12px] tracking-[0.15em] uppercase font-bold mb-3">About Us</p>
              <p className="text-[14px] text-[#2B44FF]/85 leading-relaxed">
                Homedays &mdash; post-alt / pop-emo out of Cleveland.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                <a href="https://www.instagram.com/homedaysband" className="text-[13px] text-[#2B44FF]/85 underline underline-offset-2 hover:text-[#2B44FF] transition-colors">Instagram</a>
                <a href="https://homedaysband.com" className="text-[13px] text-[#2B44FF]/85 underline underline-offset-2 hover:text-[#2B44FF] transition-colors">homedaysband.com</a>
              </div>
            </div>
            <div>
              <p className="text-[14px] text-[#2B44FF]/85 leading-relaxed">
                We pitched {venue.name} for the local opener slot on{" "}
                {new Date(pitch.showDate + "T12:00:00").toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}.
                If your team weighs in on local supports, we&apos;d be honored. Otherwise
                we&apos;ll be at the front of the room either way.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[14px] text-[#2B44FF]/85">
                &mdash; Dave (Homedays)
              </p>
              <a href="mailto:homedaysband@gmail.com" className="text-[13px] text-[#2B44FF]/85 underline underline-offset-2 hover:text-[#2B44FF] transition-colors">
                homedaysband@gmail.com
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom spacer for docked player */}
      <div className="h-24" />

      <DockedPlayer tracks={tracks} bandSlug={pitch.slug} />

      <style jsx global>{`
        .docked-player-container {
          display: block;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
        }
        .pitch-slider {
          position: relative;
          display: flex;
          align-items: center;
          height: 20px;
          cursor: pointer;
        }
        .pitch-slider.pitch-volume-slider {
          flex: 1;
        }
        .pitch-slider-track {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(43, 68, 255, 0.12);
          border-radius: 9999px;
        }
        .pitch-volume-slider .pitch-slider-track {
          height: 2px;
        }
        .pitch-slider-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--media-slider-fill);
          height: 100%;
          background: rgba(43, 68, 255, 0.5);
          border-radius: 9999px;
        }
        .pitch-slider-thumb {
          position: absolute;
          left: var(--media-slider-fill);
          width: 12px;
          height: 12px;
          background: #2B44FF;
          border-radius: 50%;
          transform: translateX(-50%) scale(0);
          transition: transform 150ms ease;
        }
        .pitch-volume-slider .pitch-slider-thumb {
          width: 8px;
          height: 8px;
        }
        .pitch-slider[data-interactive] .pitch-slider-thumb {
          transform: translateX(-50%) scale(1);
        }
        .pitch-slider[data-dragging] .pitch-slider-thumb {
          transform: translateX(-50%) scale(1.1);
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-1" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[12px] tracking-[0.15em] uppercase text-[#2B44FF]/90">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function RecList({
  recs,
  venueKey,
  showDay,
}: {
  recs: Rec[];
  venueKey: string;
  showDay: number;
}) {
  return (
    <div className="space-y-0">
      {recs.map((rec, i) => {
        const isClosed = rec.closedDays?.includes(showDay);
        return (
          <div key={rec.name} className={isClosed ? "opacity-50" : ""}>
            {i > 0 && <div className="my-5 border-b border-dotted border-[#2B44FF]/15" style={{ marginLeft: "-2.5rem", marginRight: "-2.5rem" }} />}
            {rec.prefix && (
              <p className="text-[12px] tracking-[0.15em] uppercase text-[#2B44FF]/85 mb-1">
                {rec.prefix}
              </p>
            )}
            <p className="text-[14px] tracking-[0.05em] uppercase font-bold mb-0.5">
              {rec.name}
              {isClosed && (
                <span className="ml-2 text-[12px] font-normal normal-case tracking-normal text-[#2B44FF]/90">
                  Closed {dayName(showDay)}s
                </span>
              )}
            </p>
            {rec.address && (
              <p className="text-[14px] text-[#2B44FF]/85 mb-1">
                {rec.address}
              </p>
            )}
            {rec.venueNotes[venueKey] && (
              <p className="text-[13px] text-[#2B44FF]/70 italic mb-1">
                {rec.venueNotes[venueKey]}
              </p>
            )}
            <p className="text-[15px] text-[#2B44FF]/85 leading-relaxed">
              {rec.description}
            </p>
            {rec.hours && !isClosed && (
              <p className="text-[14px] text-[#2B44FF]/85 mt-1">{rec.hours}</p>
            )}
            {rec.phone && (
              <p className="text-[14px] text-[#2B44FF]/85">
                Phone: <a href={`tel:${rec.phone}`} className="underline hover:text-[#2B44FF] transition-colors">{rec.phone}</a>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

