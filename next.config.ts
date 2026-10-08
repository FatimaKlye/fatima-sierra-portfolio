import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The standalone projects page was merged into the homepage projects section.
      { source: "/projects", destination: "/#projects", permanent: false },
    ];
  },
};

export default nextConfig;
