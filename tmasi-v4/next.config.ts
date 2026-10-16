import type { NextConfig } from "next";

// TMASI v4 home (spec 009). A preview on HCIG Work next to v3, never indexed.
const basePath = "/tmasi/v4";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
