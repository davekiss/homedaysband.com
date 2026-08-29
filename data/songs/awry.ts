// Product truth for the "Awry" single. Anything null here is not yet
// supplied by the band — the page collapses that region rather than
// showing placeholder text. See PRODUCT.md.

export type LyricSection = {
  // Optional song-time mark for the margin column, e.g. "0:41".
  time?: string;
  lines: string[];
  // True for the lines printed on the back of the NFC card.
  onCard?: boolean;
};

export type Song = {
  title: string;
  artist: string;
  releaseDate: string;
  releaseDateISO: string;
  origin: string;
  // Printed on the back panel's track line. From the master WAV (3:05).
  duration: string;
  src: string;
  artwork: string;
  artworkFull: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  credits: { role: string; name: string }[];
  lyrics: LyricSection[] | null;
};

export const awry: Song = {
  title: "Awry",
  artist: "Homedays",
  releaseDate: "July 31, 2026",
  releaseDateISO: "2026-07-31",
  origin: "Cleveland, Ohio",
  duration: "3:05",
  src: "/music/awry.wav",
  artwork: "/images/awry-single-1600.jpg",
  artworkFull: "/images/awry-single.jpg",
  spotifyUrl: "https://open.spotify.com/track/2zcZjk3mxHtH2P4eiOiLis",
  appleMusicUrl: "https://music.apple.com/us/album/awry-single/6793744592",
  credits: [
    { role: "Recorded at", name: "Plastic Dino Recordings" },
    { role: "Produced by", name: "Tuck Mindrum" },
    { role: "Guitar, vocals, lyrics", name: "Dave Kiss" },
    { role: "Bass", name: "Mark Shannon" },
    { role: "Drums", name: "Alex Christian" },
  ],
  // Lyrics to come from the band. Mark the card's printed lines with
  // `onCard: true` and give sections a `time` for the margin column.
  lyrics: null,
};
