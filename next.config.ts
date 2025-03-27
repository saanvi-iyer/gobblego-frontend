import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/assets/images/:id",
        destination: "https://gobblego.s3.ap-south-1.amazonaws.com/assets/:id",
      },
    ];
  },
};

export default nextConfig;
