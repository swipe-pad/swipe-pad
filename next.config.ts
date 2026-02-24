import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "app.hypercerts.org",
      },
      {
        protocol: "https",
        hostname: "hypercerts.org",
      },
      {
        protocol: "https",
        hostname: "images.weserv.nl",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "production-karma-gap-projects.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.celorean.school",
      },
      {
        protocol: "https",
        hostname: "bafybeihaqyxy6vrelryd66eewjggu3tafuv2hfof6cmzzga2qpfmd4gmue.ipfs.w3s.link",
      },
      {
        protocol: "https",
        hostname: "learn.tg",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
    ],
  },
  reactCompiler: !isDev,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
