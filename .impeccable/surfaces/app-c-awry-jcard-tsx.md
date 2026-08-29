---
version: 1
slug: "app-c-awry-jcard-tsx"
primary_target: "app/c/awry/JCard.tsx"
related_targets: ["app/c/awry/[[...card]]/page.tsx","app/c/awry/layout.tsx","data/songs/awry.ts"]
---

---
version: 1
slug: "app-songs-awry-jcard-tsx"
primary_target: "app/c/awry/JCard.tsx"
related_targets: ["app/c/awry/page.tsx","app/c/awry/layout.tsx","data/c/awry.ts"]
---

# /c/awry — surface brief

Scope: the single-song page for "Awry". Visitor mode: Persuade (the visitor acts: saves the song on Spotify / Apple Music; the on-page listen is the proof).

Audience and job: someone who bought the Awry NFC card at the merch table and tapped it — phone, at a show (dark, loud, one thumb) or later at home; secondarily anyone with the public link. Card front: the art; card back: several lyric lines. Card-holder perk: the full lyrics on the page (no download; page stays public and stream-only).

Action: Save on Spotify / Apple Music (real links in data/c/awry.ts). Proof: the master WAV plays on the page. Content: art, title, release date (July 31, 2026), credits, lyrics (when supplied).

Chosen direction: The Cassette J-Card (seed 9a1c93e4, surface scope, persuade). The page is the unfolded insert of the single — cover panel (art, play disc, "Also on" row at its foot), spine, lyric fold (collapses when lyrics are null), back panel (title, meta, ruled credits, two save buttons) — lying on the night-lit table of the homepage's room, with the deck transport fixed beneath (rewind/play/forward, time slider, tape counter, volume on desktop). Memorable moment: the insert unfolds along its creases on load; the counter turns while the song plays.

Kept from the round's declined challengers: ruled credits caption (Sapeur plate), night ground (Sleeping City), one continuous sheet (Ebru), margin time-marks for the lyric fold (Orizuru).

Unresolved: which lyric lines are printed on the card (mark with `onCard: true` in data/c/awry.ts) and song-time marks for the margin column (`time`). On desktop the lyric fold scrolls inside the flat insert under a paper fade; on phones it is fully expanded. Anti-goals: no WebGL, no stacked smart-link page, no autoplay, no invented credits or quotes.
