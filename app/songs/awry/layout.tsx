const DIRECTION_CONTRACT = `
THESIS: /songs/awry is the unfolded J-card insert of the single, not a smart-link
page of stacked buttons. The insert lies open on the night-lit table of the
homepage's room; the deck's transport sits beneath it.
OWN-WORLD: cream card stock (#efe6cf) with visible creases on a night ground
(#100e0b→#1a1614) pooled with lamp-yellow (#e9d27a); ink #2a2416; Theseasons
for headings and the spine; Geist for printed text; a walnut-black deck with
a tape counter in tabular numerals; authored SVG icons, one stroke weight.
STORY: a card-holder taps in, sees the cover with play and the "Also on"
row, presses play, reads the lyric fold (the card's lines marked), and saves
the song on Spotify or Apple Music from the back panel.
FIRST VIEWPORT: phone — the cover panel fills the width, art edge to edge,
play disc centered on it, the printed row "Also on Spotify · Apple Music"
at its foot, the deck fixed at the bottom edge. Desktop — the whole insert
flat in one viewport: cover, spine, lyric fold, back panel; deck beneath.
FORM: The Cassette J-Card, candidate 6 of 7 on the grounded list, dealt by
seed 9a1c93e4 (surface scope, persuade) and locked by the user.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying
its provenance.
`;

export default function AwryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        hidden
        aria-hidden
        dangerouslySetInnerHTML={{ __html: `<!-- impeccable:direction 9a1c93e4\n${DIRECTION_CONTRACT}-->` }}
      />
      {children}
    </>
  );
}
