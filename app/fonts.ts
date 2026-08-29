import { Cousine } from "next/font/google";

// The printed text on the physical song cards is Andale Mono. It ships on
// Macs but not phones, so Cousine (same proportions) rides as the fallback
// wherever the card world appears: song pages and the shelf.
export const cousine = Cousine({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cousine",
  display: "swap",
});
