import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 85 is used for the phone screenshots on the case studies, whose small UI text blurs at the default.
    qualities: [75, 85],
  },
  async redirects() {
    return [
      // Certifications moved from /credentials to their own /certifications page.
      { source: "/credentials", destination: "/certifications", permanent: true },
    ];
  },
};

export default nextConfig;
