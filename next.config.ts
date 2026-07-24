import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/logos/:path*',
        destination: '/api/public/images/uploads/logos/:path*',
      },
      {
        source: '/uploads/certificates/:path*',
        destination: '/api/public/images/uploads/certificates/:path*',
      },
    ];
  },
};

export default nextConfig;
