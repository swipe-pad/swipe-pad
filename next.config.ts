import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: !isDev,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
