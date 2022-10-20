/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["vt.ns-mlab.nl"],
  },
};

module.exports = nextConfig;
