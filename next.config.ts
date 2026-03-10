import type { NextConfig } from "next";

import { getAllowedDevOrigins } from "./src/config/app-urls";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  devIndicators: false,
  reactCompiler: !isDev,
  allowedDevOrigins: getAllowedDevOrigins(),
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
