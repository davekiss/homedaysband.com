import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // /listen used to host the 3D cassette player scene; it's
        // now on the homepage, so permanently redirect any old
        // links (including shared URLs) to /.
        source: "/listen",
        destination: "/",
        permanent: true,
      },
      {
        // Song pages moved under /c ("card") so the NFC cards can carry
        // an optional card number: /c/awry/017.
        source: "/songs/:song",
        destination: "/c/:song",
        permanent: true,
      },
      {
        source: "/songs/:song/:card",
        destination: "/c/:song/:card",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
