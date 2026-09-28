// TMASI's own social profiles, exactly as linked in the live tmasi.net footer (2026-09-26 backup).
// Icons are inline line drawings so they stay sharp and inherit the text colour.

const PROFILES = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1C5iAP5qZD/?mibextid=wwXIfr",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/tmasi_global?igsh=MTBvbG5nMmtudXBiaQ==",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/tmasi-gmbh/",
    icon: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
];

type Props = {
  /** "dark" for navy backgrounds (footer, transparent header), "light" for white backgrounds. */
  tone?: "dark" | "light";
  size?: number;
};

export default function SocialLinks({ tone = "dark", size = 40 }: Props) {
  const iconSize = Math.round(size * 0.45);
  return (
    <>
    <ul className={`social-links social-links--${tone}`} aria-label="TMASI Global on social media">
      {PROFILES.map((p) => (
        <li key={p.name}>
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`TMASI Global on ${p.name}`}
            style={{ width: size, height: size }}
          >
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {p.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .social-links { display: flex; gap: 10px; list-style: none; margin: 0; padding: 0; }
        .social-links a { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
          transition: background-color .25s ease, color .25s ease, border-color .25s ease; }
        .social-links--dark a { color: #ffffff; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); }
        .social-links--light a { color: #0F205C; background: transparent; border: 1px solid #e2e8f0; }
        .social-links a:hover, .social-links a:focus-visible { background: var(--tmasi-teal); border-color: var(--tmasi-teal); color: #ffffff; }
        .social-links a:focus-visible { outline: 2px solid var(--tmasi-teal); outline-offset: 2px; }
      `,
        }}
      />
    </>
  );
}
