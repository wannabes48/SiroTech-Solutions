/** @type {import('next').NextConfig} */
const nextConfig = {
  // Limit parallel worker threads to prevent JavaScript heap exhaustion
  experimental: {
    cpus: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
