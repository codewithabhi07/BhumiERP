/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/billing',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
