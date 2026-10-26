// The home page, in order. One list used by the local preview, the canvas builder and the site.
import * as hero from "./hero-b.mjs";
import * as home from "./home.mjs";
import * as home2 from "./home2.mjs";

export const HOME_SECTIONS = [
  // the live site's order (owner, 2026-10-26): About first, then as on healthcareig.com
  hero.heroB, home.about, home.group, home2.missionVision, home2.why, home2.built, home2.eco, home2.care, home.insurers,
];

export const homeCss = ({ asset }) =>
  [hero.css({ asset }), home.insurersCss, home.aboutCss, home.groupCss, home2.ecoCss, home2.mvCss, home2.whyCss, home2.builtCss, home2.careCss].join("\n");
