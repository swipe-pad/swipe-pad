import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: !isDev,
  allowedDevOrigins: ["swipe.lady", "swipepad.0tt0.top"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
