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

export type Print = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Song = {
  title: string;
  artist: string;
  releaseDate: string;
  releaseDateISO: string;
  origin: string;
  // Printed on the back panel's track line. From the master WAV (3:05).
  duration: string;
  // The physical NFC card this page is printed for.
  cardLabel: string;
  src: string;
  artwork: string;
  artworkFull: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  credits: { role: string; name: string }[];
  lyrics: LyricSection[] | null;
  // Behind-the-scenes prints that only live on this page.
  prints: Print[];
  printsCaption: string;
};

export const awry: Song = {
  title: "Awry",
  artist: "Homedays",
  releaseDate: "July 31, 2026",
  releaseDateISO: "2026-07-31",
  origin: "Cleveland, Ohio",
  duration: "3:05",
  cardLabel: "Homedays Song Card 01",
  // 320k MP3 encoded from the 24-bit/48k master WAV (~/Downloads/Awry.wav, Jul 22 2026).
  src: "/music/awry.mp3",
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
  printsCaption: "Plastic Dino Recordings, March 2026. These only live here.",
  prints: [
    {
      src: "/images/studio/awry/awry-session-03.jpg",
      width: 1600,
      height: 1200,
      alt: "The tracking room at Plastic Dino: drums, mics, pianos, and amps in the afternoon sun",
    },
    {
      src: "/images/studio/awry/awry-session-01.jpg",
      width: 1200,
      height: 1600,
      alt: "Dave in headphones with a guitar, Alex behind the drums, Mark on bass",
    },
    {
      src: "/images/studio/awry/awry-session-04.jpg",
      width: 1600,
      height: 1200,
      alt: "Mark tracking bass by the control-room window",
    },
    {
      src: "/images/studio/awry/awry-session-02.jpg",
      width: 1200,
      height: 1600,
      alt: "The studio couch between takes",
    },
  ],
  // Mark the lines printed on the NFC card with `onCard: true`, and give
  // sections a `time` ("0:41") to fill the margin column.
  lyrics: [
    {
      lines: [
        "not quite what I had in mind",
        "took a turn and got lost",
        "somewhere along the way",
        "things went awry",
      ],
    },
    {
      lines: [
        "we were all lined up",
        "perfect cursive",
        "over time you",
        "started acting aversive",
      ],
    },
    {
      lines: [
        "went a little too hard",
        "burned out like a campfire",
        "smoldering through the night",
      ],
    },
    {
      lines: [
        "had all the makings",
        "to be the next big thing",
        "an overnight success",
        "that never came to be",
      ],
    },
    {
      lines: [
        "so tell me",
        "where did all our plans go awry?",
        "where did all our plans go awry?",
      ],
    },
    {
      lines: [
        "not right in my scattered mind",
        "Brushed it off took the loss",
        "somehow we’ve gone astray",
        "things went awry",
      ],
    },
    {
      onCard: true,
      lines: [
        "I was so fed up",
        "With your coercion",
        "Tryna control me",
        "But i’m my own person",
      ],
    },
    {
      onCard: true,
      lines: [
        "Went a little too far",
        "I snapped",
        "like a winter coat",
        "Braving the cold",
      ],
    },
    {
      lines: [
        "we were so fixated",
        "on moments long past",
        "barely even noticed",
        "the opportunity pass",
      ],
    },
    {
      lines: [
        "where did all our plans go awry?",
        "where did all our plans go awry?",
        "where did all our plans go awry?",
        "where did all our plans go awry?",
        "where did all our plans go?",
      ],
    },
    {
      onCard: true,
      lines: ["let’s stay up past our bedtime and talk"],
    },
  ],
};
