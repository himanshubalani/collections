import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['squiggly-impromptu-automated.ngrok-free.dev'],
  output: 'export',
  images: {
    unoptimized: true, // Required for static export on GitHub pages
  },
  // Note: If your repo is named "collections" and you ARE NOT using a custom domain, 
  // you must uncomment and set the basePath below so assets load correctly:
  basePath: '/collections',
};

export default nextConfig;
