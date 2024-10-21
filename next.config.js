/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "black-personal-vulture-785.mypinata.cloud",
      },
    ],
  },
}

module.exports = nextConfig
