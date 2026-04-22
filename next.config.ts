import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Instagram
      {
        protocol: "https",
        hostname: "**.instagram.com",
      },

      // Facebook CDN (avatars)
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },

      // Facebook profile images (important)
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
    ],
  },
};

export default nextConfig;