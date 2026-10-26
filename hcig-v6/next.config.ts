import type { NextConfig } from "next";

/* One codebase, two builds:
   HCIG_TARGET=preview (default) -> static export under hcig-passport.vercel.app/hcig/v6, noindex
   HCIG_TARGET=live              -> static export for healthcareig.com (go-live, P9) */
const target = process.env.HCIG_TARGET === "live" ? "live" : "preview";
const basePath = target === "preview" ? "/hcig/v6" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_TARGET: target },
};

export default nextConfig;
