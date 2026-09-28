import type { NextConfig } from "next";

const basePath = "/tmasi/v3";

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
