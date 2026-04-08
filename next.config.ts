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
    ];
  },
};

export default nextConfig;
