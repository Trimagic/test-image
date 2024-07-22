import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev"

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-fb93debbc9ff40c882f71aa27e066152.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-f19f3427c40848949245d744a3d8b627.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
