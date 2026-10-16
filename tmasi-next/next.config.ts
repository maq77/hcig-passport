import type { NextConfig } from "next";

// The HCIG Work preview lives under /tmasi/v3. The tmasi.net build sets TMASI_BASE_PATH="" (npm run build:live),
// which also turns on indexing and the live analytics tags.
const basePath = process.env.TMASI_BASE_PATH ?? "/tmasi/v3";

const nextConfig: NextConfig = {
  output: "export",
  // Addresses end with a slash, like the live site (/about/, /de/uber-uns/).
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // One root layout per language, so the 404 comes from app/global-not-found.tsx.
  experimental: { globalNotFound: true },
};

export default nextConfig;
