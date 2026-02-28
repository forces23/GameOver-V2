import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com'
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com'
      },
      {
        protocol: 'https',
        hostname: 'www.google.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.thegamesdb.net'
      },
      
    ]
  }
};

export default nextConfig;
