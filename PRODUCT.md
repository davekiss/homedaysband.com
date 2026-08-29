# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Fans** — people who saw Homedays live in Northeast Ohio. Reach the site from Instagram, show flyers, and physical merch. For `/c/awry` specifically: someone who bought an "Awry" NFC card at the merch table and tapped it with their phone — at the show (dark, loud, one thumb) or later at home.
- **Bookers, venues, and press** — evaluate the band via `/epk` and per-venue pitch pages (`/welcome/[band]`). Desktop, time-poor, want the songs and a credible picture fast.

## Product Purpose

homedaysband.com is the band's home on the web: listen to the songs, see upcoming shows, and (for industry) get the EPK. The homepage is an interactive 3D room with a cassette deck that plays the catalog. Success is people listening and carrying the band into their own libraries and calendars.

## Positioning

Homedays is "just a band from Cleveland, Ohio" — the site is deliberately personal and physical (a room, tapes, torn calendar pages, guitar picks, Polaroids) rather than a template artist page. Physical objects extend online: NFC merch cards link to song pages.

## Operating Context

- Live shows around Cleveland / Northeast Ohio (Grog Shop, Musica, West Side Bowl, Waterloo Arts Fest). Merch table sells NFC cards for "Awry".
- Catalog audio is hosted on Mux as static m4a renditions (`muxStatic()` in `app/components/CassettePlayer/mux.ts`). The Awry song page streams a 320k MP3 (`public/music/awry.mp3`) encoded from the master WAV.
- Pitch pages email the band (Resend) when a booker listens ≥15s.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, Tailwind 4, react-three-fiber for the homepage scene, `@videojs/react` v10 (beta) for headless custom audio players.
- Song page `/c/awry`: on-site playback plus links to Spotify (`open.spotify.com/track/2zcZjk3mxHtH2P4eiOiLis`) and Apple Music (`music.apple.com/us/album/awry-single/6793744592`).
- Band name is **Homedays** — one word, no space.
- NFC "Awry" card (sold at the merch table): album art on the front, a lyric snippet printed on the back, taps to `/c/awry/<serial>` (e.g. `/c/awry/017`); the page prints the serial on the back panel. Card holders' perk is the full lyrics / liner notes on the page (no download). The page stays public and stream-only.
- **The shelf** (growth mechanic): a tap with a serial puts that song card on the visitor's shelf (localStorage, no accounts). The shelf has 12 slots — the planned song-card run, `TOTAL_SLOTS` in `data/cards.ts` — filled ones show the art and serial, the rest are dimmed silhouettes. With one card it sits under the insert; from the second card it leads the page. The shelf serializes into its share link (`/shelf?c=01.017,…`), which is also its persistence: `/shelf/og?c=…` renders it as an image (1200×630 for link unfurls, `&format=story` 1080×1920 for Instagram Stories) and the share button offers the image file first via Web Share, then the link, then copy. Someone else's link shows their shelf and never merges into yours. No email capture, no "collect them all" copy, no onboarding.
- Card registry: `data/cards.ts` (slot number, slug, title, art). Only Awry (01) exists; new cards need an entry there plus a song in `data/songs/`.
- Lyrics for Awry are in `data/c/awry.ts`; the lines printed on the card back are not yet marked (`onCard: true`).

## Brand Commitments

- Name: Homedays. Tagline in use: "Just a band from Cleveland, Ohio" / "Coming soon to a CD-RW near you".
- Heading font: Theseasons (local, `public/fonts`), used for h1–h3 site-wide.
- Incumbent look: warm, film-grained, nostalgic domestic interior (dark wood, string lights, tape hiss). Awry single art: a foggy Lake Erie shoreline with beach chairs, hand-cut yellow letters (`public/images/awry-single.jpg`, 3000², from `~/Music/Homedays/awry-single.jpg`).
- Instagram: @homedaysband.

## Evidence on Hand

- Awry single released **July 31, 2026**. Master WAV lives at `~/Downloads/Awry.wav` (24-bit/48k, 3:05); the site ships `public/music/awry.mp3` (320k). Art: `public/images/awry-single.jpg` and `-1600.jpg`.
- Catalog of 12 tracks on Mux (see `app/components/CassettePlayer/index.tsx`).
- Shows in `data/shows.ts`; venue notes in `data/venues.ts`.
- EPK press quotes and highlights in `app/components/EPKPage.tsx` — treat as unverified copy, do not propagate.
- Awry credits (confirmed): recorded at Plastic Dino Recordings; produced by Tuck Mindrum; Dave Kiss — guitar, vocals, lyrics; Mark Shannon — bass; Alex Christian — drums.
- Lyrics for Awry: in `data/c/awry.ts` (supplied by the band Aug 28 2026). "Homedays Song Card 01" prints the "I was so fed up" and "went a little too far" verses, one chorus line, and the bedtime outro; those sections are marked `onCard`.

## Product Principles

1. Physical first — the site behaves like objects you can hold, not a streaming template.
2. Listening is the proof; get people to the song within one gesture.
3. Carry the listener out to where they actually keep music (Spotify, Apple Music) — the site is not trying to be the library.
4. Honest and local: real shows, real venues, real recordings; nothing invented.
