import { asset } from "@/lib/site";

/** The HC mark as a watermark, a use the guideline names for the mark on its own (page 3). Decorative only. */
export function Watermark({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  return <img className={`wm ${className}`} src={asset(tone === "dark" ? "mark-black" : "mark-white")} alt="" aria-hidden="true" loading="lazy" />;
}

/** The soft flowing lines of the HCIG stationery (business card, letterhead, envelopes), in Turquoise and Dim Gray tints. */
export function Ribbons({ className = "" }: { className?: string }) {
  return (
    <svg className={`ribbons ${className}`} viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 250 C 180 200, 330 120, 520 150 S 760 230, 800 120" stroke="#A0E6E8" strokeWidth="1.4" fill="none" />
      <path d="M0 268 C 200 214, 350 150, 540 172 S 770 240, 800 150" stroke="#D0F2F4" strokeWidth="6" fill="none" />
      <path d="M0 230 C 160 190, 320 100, 500 128 S 740 210, 800 96" stroke="#DDDDDF" strokeWidth="1" fill="none" />
      <path d="M0 286 C 220 240, 380 180, 560 196 S 780 252, 800 182" stroke="#71D9DD" strokeWidth=".9" fill="none" />
      <path d="M0 210 C 150 176, 300 84, 480 108 S 720 190, 800 72" stroke="#BBBCBE" strokeWidth=".7" fill="none" />
    </svg>
  );
}
