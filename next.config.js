/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // ✅ Disable SWC minify to fix issues
  images: {
    unoptimized: true, // ✅ Disable image optimization
    domains: ['via.placeholder.com', 'images.unsplash.com'], // ✅ Allow external images
  },
  async headers() {
    return [
      {
        source: '/modules/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig