import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.11',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'fzyqoaohikmhdlzjfcax.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'https://triptask-backend.up.railway.app/:path*',
      },
    ];
  },
};

export default nextConfig;
