import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage signed URL 사용 시 도메인 추가
      // { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
