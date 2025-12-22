// <== NEXT CONFIG ==>
import type { NextConfig } from "next";

// <== NEXT CONFIG ==>
const nextConfig: NextConfig = {
  // <== IMAGES ==>
  images: {
    remotePatterns: [
      {
        // GITHUB AVATARS
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        // GITHUB RAW CONTENT (FOR CODE BROWSER IMAGES)
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        // SUPABASE STORAGE
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
