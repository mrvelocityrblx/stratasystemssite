/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "echoai.stratasystems.vercel.app",
          },
        ],
        destination: "/echoai/:path*",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "daywise.stratasystems.vercel.app",
          },
        ],
        destination: "/daywise/:path*",
      },
    ]
  },
}

export default nextConfig
