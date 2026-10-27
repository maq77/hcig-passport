import type { NextConfig } from "next";

/* One codebase, two builds:
   HCIG_TARGET=preview (default) -> static export under hcig-passport.vercel.app/hcig/v6, noindex
   HCIG_TARGET=live              -> static export for healthcareig.com (go-live, P9) */
const target = process.env.HCIG_TARGET === "live" ? "live" : "preview";
const lang = process.env.HCIG_LANG || "en";
const root = target === "preview" ? "/hcig/v6" : "";
const basePath = root + (lang === "en" ? "" : `/${lang}`);
// other languages: every content module resolves to its translated copy written by scripts/i18n-gen.mjs
const MODULES = ["home", "pages", "maritime", "blog", "brands"];
const alias = lang === "en" ? {} : Object.fromEntries(MODULES.map((m) => [`@/content/${m}.mjs`, `./.i18n/${lang}/${m}.mjs`]));

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_ROOT: root, NEXT_PUBLIC_LANG: lang, NEXT_PUBLIC_TARGET: target },
  turbopack: { resolveAlias: alias },
};

export default nextConfig;
