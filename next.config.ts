import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/logos/:path*',
        destination: '/api/public/images/uploads/logos/:path*',
      },
    ];
  },
};

export default nextConfig;
