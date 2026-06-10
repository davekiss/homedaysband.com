import * as THREE from "three";

export const CALENDAR_PAGE_ASPECT = 666 / 512;
export const DESK_PAGE_ASPECT = 634 / 512;

type CalendarPageOptions = {
  month: string; // e.g. "JULY"
  year: string; // e.g. "2026"
  day: string; // e.g. "25"
  weekday: string; // e.g. "SATURDAY"
  torn?: boolean; // jagged top edge, as if ripped off the block
  circled?: boolean; // red sharpie loop around the day number
  scrawl?: string[]; // handwritten lines under the date (pen ink)
};

// Draws a classic page-a-day tear-off calendar sheet: red month band up
// top, oversized day number, weekday underneath. Torn pages get a ragged
// top edge cut into the texture's alpha channel; the wall pages add a
// sharpie circle and a handwritten venue scrawl.
export function createCalendarPageTexture({
  month,
  year,
  day,
  weekday,
  torn = false,
  circled = false,
  scrawl,
}: CalendarPageOptions): THREE.CanvasTexture {
  const w = 512;
  const h = torn ? 666 : 634;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // ── Page silhouette — fill first, then composite everything else
  // "source-atop" so the torn edge clips all later drawing for free ──
  const tearPoints: [number, number][] = [];
  ctx.beginPath();
  if (torn) {
    let first = true;
    for (let x = 0; x <= w; x += 12 + Math.random() * 8) {
      const y = 4 + Math.random() * 16;
      tearPoints.push([Math.min(x, w), y]);
      if (first) {
        ctx.moveTo(0, y);
        first = false;
      } else {
        ctx.lineTo(Math.min(x, w), y);
      }
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
  } else {
    ctx.rect(0, 0, w, h);
  }
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#f6efdc");
  bg.addColorStop(1, "#ebdfc2");
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.globalCompositeOperation = "source-atop";

  // ── Red month band ──
  const bandTop = torn ? 20 : 0;
  const bandH = 96;
  const band = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH);
  band.addColorStop(0, "#b5402f");
  band.addColorStop(1, "#9e3526");
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, w, bandH);

  // Month + year centered in the band, year smaller and dimmer
  ctx.textBaseline = "middle";
  const bandMid = bandTop + bandH / 2;
  ctx.font = "bold 48px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  const mW = ctx.measureText(month).width;
  ctx.font = "26px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  const yW = ctx.measureText(year).width;
  const startX = (w - mW - 14 - yW) / 2;
  ctx.fillStyle = "#f3e9d2";
  ctx.font = "bold 48px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(month, startX, bandMid + 2);
  ctx.fillStyle = "rgba(243, 233, 210, 0.75)";
  ctx.font = "26px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(year, startX + mW + 14, bandMid + 6);

  // ── Paper grain ──
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const a = Math.random() * 0.05;
    ctx.fillStyle = `rgba(110, 85, 35, ${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // ── Giant day number ──
  const hasScrawl = !!scrawl?.length;
  const numCY = hasScrawl ? 300 : bandTop + bandH + 210;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(38, 36, 32, 0.92)";
  ctx.font = "bold 250px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(day, w / 2, numCY + 12);

  // ── Weekday ──
  const weekdayY = hasScrawl ? 462 : numCY + 200;
  ctx.fillStyle = "rgba(85, 78, 64, 0.85)";
  ctx.font = "30px 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(weekday.split("").join("  "), w / 2, weekdayY);
  ctx.textAlign = "left";

  // ── Red sharpie loop around the number — two wobbly overlapping
  // passes so it reads as a real marker circling the date ──
  if (circled) {
    ctx.lineCap = "round";
    const cx = w / 2;
    const cy = numCY;
    for (let pass = 0; pass < 2; pass++) {
      const rx = 168 - pass * 9;
      const ry = 138 - pass * 7;
      const phase = Math.random() * Math.PI * 2;
      ctx.strokeStyle = `rgba(194, 48, 38, ${0.68 - pass * 0.18})`;
      ctx.lineWidth = 9 - pass * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.07 + pass * 0.05);
      ctx.beginPath();
      const start = Math.random() * Math.PI * 2;
      for (let t = 0; t <= Math.PI * 2 + 0.45; t += 0.08) {
        const wob = Math.sin(t * 3 + phase) * 5 + (Math.random() - 0.5) * 3;
        const x = Math.cos(start + t) * (rx + wob);
        const y = Math.sin(start + t) * (ry + wob);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Handwritten scrawl — same dark blue pen as the post-it note ──
  if (scrawl?.length) {
    const INK = "22, 30, 95";
    const handFont = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive";
    const maxW = w - 90;

    const drawHandText = (
      text: string,
      startX: number,
      startY: number,
      angle = 0
    ) => {
      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(angle);
      let cx = 0;
      for (const char of text) {
        const jx = (Math.random() - 0.5) * 1.4;
        const jy = (Math.random() - 0.5) * 2;
        let ink = 0.62 + Math.random() * 0.32;
        if (Math.random() < 0.14) {
          ink = 0.12 + Math.random() * 0.22;
        }
        ctx.fillStyle = `rgba(${INK}, ${ink})`;
        ctx.fillText(char, cx + jx, jy);
        if (Math.random() < 0.06) {
          ctx.fillStyle = `rgba(${INK}, 0.35)`;
          ctx.fillText(char, cx + jx + 0.4, jy + 0.3);
        }
        cx += ctx.measureText(char).width;
      }
      ctx.restore();
    };

    ctx.textBaseline = "top";
    const baseSizes = [36, 46, 30];
    let y = 498;
    scrawl.forEach((line, i) => {
      let size = baseSizes[Math.min(i, baseSizes.length - 1)];
      const weight = i === 1 ? "bold " : "";
      ctx.font = `${weight}${size}px ${handFont}`;
      while (ctx.measureText(line).width > maxW && size > 18) {
        size -= 2;
        ctx.font = `${weight}${size}px ${handFont}`;
      }
      const lineW = ctx.measureText(line).width;
      const x = (w - lineW) / 2 + (Math.random() - 0.5) * 10;
      drawHandText(line, x, y, (Math.random() - 0.5) * 0.04);
      y += size + 14;
    });
  }

  // ── Soft shading: bottom edge falloff + fiber line along the tear ──
  const shade = ctx.createLinearGradient(0, h - 50, 0, h);
  shade.addColorStop(0, "rgba(120, 90, 40, 0)");
  shade.addColorStop(1, "rgba(120, 90, 40, 0.12)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, h - 50, w, 50);

  if (torn && tearPoints.length > 1) {
    ctx.strokeStyle = "rgba(150, 120, 80, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    tearPoints.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y + 1);
      else ctx.lineTo(x, y + 1);
    });
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

// Splits a Show-style date string ("July 25, 2026") into the pieces the
// page design needs.
export function calendarParts(dateString: string) {
  const d = new Date(dateString);
  return {
    month: d.toLocaleString("en-US", { month: "long" }).toUpperCase(),
    year: String(d.getFullYear()),
    day: String(d.getDate()),
    weekday: d.toLocaleString("en-US", { weekday: "long" }).toUpperCase(),
  };
}
