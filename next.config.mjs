/** @type {import('next').NextConfig} */
// Cache bust v2: force full rebuild
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
