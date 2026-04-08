// Build a URL for a Mux static rendition (audio.m4a, highest.mp4,
// medium.mp4, etc.) from a playback ID. Keeps call sites tidy as we
// move more assets behind Mux.
export const muxStatic = (playbackId: string, rendition: string) =>
  `https://stream.mux.com/${playbackId}/${rendition}`;
