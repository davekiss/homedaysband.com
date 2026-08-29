import type { Metadata } from "next";
import { awry } from "@/data/songs/awry";
import JCard from "./JCard";

const title = "Awry | Homedays";
const description = "Listen to \"Awry\", the new single from Homedays. Just a band from Cleveland, Ohio.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "music.song",
    images: [
      {
        url: awry.artwork,
        width: 1600,
        height: 1600,
        alt: "Awry — single artwork by Homedays",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [awry.artwork],
  },
};

export default function AwryPage() {
  return <JCard song={awry} />;
}
