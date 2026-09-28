"use client";

// 24/7 line above the header (design 1-A, approved 2026-09-28). The number and "CALL THE TEAM"
// are the live tmasi.net wording. It slides away on scroll down and returns on scroll up.

const PHONE = "+20 120 678 8566";
const TEL = "tel:+201206788566";
const WHATSAPP = "https://wa.me/201206788566";

function PhoneIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export default function HotlineBar({ hidden }: { hidden: boolean }) {
  return (
    <div className={`hotline${hidden ? " is-hidden" : ""}`}>
      <div className="hotline-inner">
        <a className="hotline-call" href={TEL}>
          <span className="hotline-badge">24/7</span>
          <span className="hotline-label">CALL THE TEAM</span>
          <span className="hotline-phone-ico"><PhoneIcon /></span>
          <span className="hotline-number">{PHONE}</span>
        </a>
        <div className="hotline-actions">
          <a className="hotline-btn hotline-only-phone" href={TEL} aria-label="Call the team">
            <PhoneIcon size={18} />
          </a>
          <a className="hotline-btn hotline-wa" href={WHATSAPP} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <ChatIcon size={17} />
            <span className="hotline-wa-text">WhatsApp</span>
          </a>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hotline {
          position: fixed; top: 0; left: 0; right: 0; z-index: 101;
          height: var(--bar-h); background: #081133; color: #ffffff;
          transition: transform .4s var(--ease);
        }
        .hotline.is-hidden { transform: translateY(-100%); }
        .hotline-inner {
          height: 100%; max-width: var(--max-w); margin: 0 auto; padding: 0 20px; box-sizing: border-box;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .hotline a { color: #ffffff; text-decoration: none; }
        .hotline-call { display: inline-flex; align-items: center; gap: 12px; min-height: 40px; }
        .hotline-badge {
          background: var(--tmasi-teal); color: #ffffff; font-size: 12px; font-weight: 800;
          letter-spacing: 0.08em; padding: 3px 10px; border-radius: 999px; line-height: 1.4;
        }
        .hotline-label { color: rgba(255,255,255,0.72); font-size: 11.5px; font-weight: 700; letter-spacing: 0.16em; }
        .hotline-phone-ico { display: inline-flex; color: #7fe0e1; }
        .hotline-number { font-size: 14px; font-weight: 700; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }
        .hotline-call:hover .hotline-number { color: #7fe0e1; }
        .hotline-actions { display: flex; align-items: center; gap: 4px; }
        .hotline-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; border-radius: 999px; }
        .hotline-wa { color: #25D366 !important; padding: 0 4px; }
        .hotline-wa-text { color: #ffffff; font-size: 13px; font-weight: 700; }
        .hotline-wa:hover .hotline-wa-text { color: #7fe0e1; }
        .hotline-only-phone { display: none; }

        @media (max-width: 768px) {
          .hotline-inner { padding: 0 8px 0 16px; }
          .hotline-label, .hotline-phone-ico, .hotline-wa-text { display: none; }
          .hotline-call { gap: 10px; min-height: 44px; }
          .hotline-badge { font-size: 11.5px; padding: 3px 9px; }
          .hotline-only-phone { display: inline-flex; color: #7fe0e1; }
          .hotline-btn { width: 44px; height: 44px; min-height: 44px; padding: 0; }
        }
      `}} />
    </div>
  );
}
