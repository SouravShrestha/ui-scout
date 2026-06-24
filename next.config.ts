import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  webpack: (config) => {
    // linkedom's canvas element is optional — we don't use it
    config.resolve.alias['canvas'] = false;
    return config;
  },
};

export default nextConfig;
