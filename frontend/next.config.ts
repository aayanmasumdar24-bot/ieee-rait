import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // We are just serving static files from public/IMG
  }
};

export default nextConfig;
