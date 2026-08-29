import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { cardBySlot, slotLabel, TOTAL_SLOTS } from "@/data/cards";
import { decodeShelf, shelfSummary } from "@/lib/shelf";

// The shelf as a picture: /shelf/og?c=01.017            (1200×630, link unfurls)
//                          /shelf/og?c=01.017&format=story (1080×1920, Stories)
// Filled slots carry the art; the rest are dimmed silhouettes. The
// empty slots are the growth mechanic, so they must read clearly.

export const runtime = "nodejs";

const NIGHT = "#100e0b";
const NIGHT_2 = "#1a1614";
const CREAM = "#f5efdd";
const STOCK = "#efe6cf";
const INK = "#2a2416";
const INK_2 = "#6b5f48";
const WOOD = "#3a2a1c";
const WOOD_2 = "#221810";

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function loadFont(url: string) {
  if (!fontCache.has(url)) {
    fontCache.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.arrayBuffer() : null))
        .catch(() => null)
    );
  }
  return fontCache.get(url)!;
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const c = req.nextUrl.searchParams.get("c");
  const story = req.nextUrl.searchParams.get("format") === "story";
  const cards = decodeShelf(c);
  const held = new Map(cards.map((x) => [x.slot, x]));

  // Cousine (Apache-2.0, shipped in public/fonts) stands in for Andale Mono.
  const [theseasons, cousine] = await Promise.all([
    loadFont(`${origin}/fonts/theseasons-bd.otf`),
    loadFont(`${origin}/fonts/Cousine-Regular.woff`),
  ]);
  const fonts: NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"] = [];
  if (theseasons) fonts.push({ name: "Theseasons", data: theseasons, weight: 700, style: "normal" });
  if (cousine) fonts.push({ name: "Cousine", data: cousine, weight: 400, style: "normal" });
  const mono = cousine ? "Cousine" : "Theseasons";

  const width = story ? 1080 : 1200;
  const height = story ? 1920 : 630;
  const perRow = story ? 3 : 6;
  const rows: number[][] = [];
  for (let s = 1; s <= TOTAL_SLOTS; s += perRow) rows.push(Array.from({ length: perRow }, (_, i) => s + i).filter((n) => n <= TOTAL_SLOTS));

  const slotW = story ? 250 : 140;
  const artW = slotW - (story ? 32 : 18);
  const gap = story ? 44 : 22;
  const pad = story ? 90 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(180deg, ${NIGHT_2} 0%, ${NIGHT} 100%)`,
          color: CREAM,
          padding: pad,
          fontFamily: mono,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: story ? 700 : 300,
            backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(233,210,122,0.17), rgba(233,210,122,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Theseasons", fontSize: story ? 84 : 56, lineHeight: 1, color: CREAM }}>Homedays</div>
            <div style={{ fontSize: story ? 30 : 22, color: "rgba(245,239,221,0.7)", marginTop: story ? 22 : 12 }}>
              {cards.length ? shelfSummary(cards.length) : "Your shelf"}
            </div>
          </div>
          <div style={{ fontSize: story ? 26 : 18, color: "rgba(245,239,221,0.5)" }}>homedaysband.com/c</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: story ? 110 : 44, gap: story ? 70 : 34 }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap, paddingLeft: story ? 30 : 16, paddingRight: story ? 30 : 16 }}>
                {row.map((slot) => {
                  const card = cardBySlot(slot);
                  const h = held.get(slot);
                  const filled = !!(h && card);
                  return (
                    <div
                      key={slot}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: slotW,
                        padding: story ? 16 : 9,
                        background: filled ? STOCK : "rgba(245,239,221,0.07)",
                        border: filled ? "none" : "2px dashed rgba(245,239,221,0.15)",
                      }}
                    >
                      {filled ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${origin}${card!.art}`} width={artW} height={artW} alt="" style={{ objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: artW, height: artW, background: "rgba(245,239,221,0.06)" }} />
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: story ? 12 : 7,
                          fontSize: story ? 20 : 12,
                          color: filled ? INK_2 : "rgba(245,239,221,0.33)",
                        }}
                      >
                        <span>{slotLabel(slot)}</span>
                        {filled && <span style={{ color: INK }}>No. {h!.no}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  height: story ? 18 : 12,
                  marginTop: story ? -2 : -1,
                  background: `linear-gradient(180deg, ${WOOD}, ${WOOD_2})`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    }
  );
}
