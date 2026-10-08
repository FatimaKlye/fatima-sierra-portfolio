import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Certifications moved from /credentials to their own /certifications page.
      { source: "/credentials", destination: "/certifications", permanent: true },
    ];
  },
};

export default nextConfig;
