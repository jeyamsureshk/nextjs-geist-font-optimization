import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    CATALYST_API_KEY: process.env.CATALYST_API_KEY,
    CATALYST_ORGANIZATION_ID: process.env.CATALYST_ORGANIZATION_ID,
    CATALYST_PROJECT_ID: process.env.CATALYST_PROJECT_ID,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    APP_NAME: process.env.APP_NAME,
    APP_URL: process.env.APP_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
