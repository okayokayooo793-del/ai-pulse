/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Serve data/ from the project root via /data path
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/api/data-proxy/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
