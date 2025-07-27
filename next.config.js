/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // ✅ Disables image optimization
  }
}

module.exports = nextConfig