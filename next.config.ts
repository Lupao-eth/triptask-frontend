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
        hostname: 'fzyqoaohikmhdlzjfcax.supabase.co', // 🔁 your Supabase project domain
        pathname: '/storage/v1/object/**',
      },
    ],
  },
};

export default nextConfig;
