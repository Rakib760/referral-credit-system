/** @type {import(''next'').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Enable static export
  basePath: '/referral-credit-system', // Your repo name
  images: {
    unoptimized: true,
  },
  trailingSlash: true, // Ensure trailing slashes for static export
}

module.exports = nextConfig