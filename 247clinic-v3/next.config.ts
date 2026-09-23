import type { NextConfig } from "next";

/* One codebase, two builds (specs/007-247clinic-v3/contracts/iis-deploy.md):
   V3_TARGET=preview (default) -> static export under hcig-passport.vercel.app/247clinic/v3, noindex
   V3_TARGET=live              -> static export for www.247clinic.net, uploaded over FTP to IIS */
const target = process.env.V3_TARGET === "live" ? "live" : "preview";
const basePath = target === "preview" ? "/247clinic/v3" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: false,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_TARGET: target },
};

export default nextConfig;
