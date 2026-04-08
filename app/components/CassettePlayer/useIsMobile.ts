"use client";

import { useEffect, useState } from "react";

// Mobile detection via media query rather than UA sniffing. Matches
// devices whose primary input is a coarse pointer without hover — i.e.
// phones and tablets — not shrunken desktop browsers. Returns `null`
// until the query has resolved on the client so callers can hold off
// mounting expensive-to-reconfigure things (like the r3f Canvas, whose
// `shadows`/`dpr` props are effectively initial-only).
export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
