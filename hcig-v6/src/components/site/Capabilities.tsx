"use client";
// Services page: the eight live capabilities as one system, on a Dim Gray depth band (the page's one dark moment),
// introduced by the partner page's own line "Not a Provider. A System.".
import { PARTNER_PAGE, SERVICES_PAGE } from "@/content/pages.mjs";
import { Icon } from "@/components/ui/Icon";
import { Item, Stagger } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/SectionHead";
import type { IconName } from "@/lib/icons";

export function Capabilities() {
  const caps = SERVICES_PAGE.capabilities as { title: string; text: string; icon: IconName }[];
  return (
    <section className="sec caps-sec" aria-labelledby="caps-h">
      <div className="wrap">
        <SectionHead id="caps-h" tone="ink" title={PARTNER_PAGE.system.title} lead={PARTNER_PAGE.system.lines[1]} />
        <Stagger as="ol" className="caps-grid" gap={0.06}>
          {caps.map((c, i) => (
            <Item as="li" className="cap" key={c.title}>
              <span className="cap-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="cap-ico" aria-hidden="true"><Icon name={c.icon} size={24} /></span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
