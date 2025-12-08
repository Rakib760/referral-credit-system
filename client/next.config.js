/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // For GitHub Pages deployment
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/referral-credit-system' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  
  // Fix for 404 in development
  distDir: '.next',
}

module.exports = nextConfig