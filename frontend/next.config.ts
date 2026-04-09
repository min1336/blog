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
      {
        source: '/tft-demo',
        destination: '/projects/tft-analysis-ai/index.html',
      },
      {
        source: '/tft-demo/:path+',
        destination: '/projects/tft-analysis-ai/:path+',
      },
    ];
  },
};

export default nextConfig;
