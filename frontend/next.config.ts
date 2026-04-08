import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/happiness-fruit',
        destination: '/projects/happiness-fruit/index.html',
      },
      {
        source: '/happiness-fruit/:path+',
        destination: '/projects/happiness-fruit/:path+',
      },
    ];
  },
};

export default nextConfig;
