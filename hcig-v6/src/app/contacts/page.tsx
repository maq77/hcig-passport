import type { Metadata } from "next";
import { CONTACT_PAGE } from "@/content/pages.mjs";
import { Shell } from "@/components/site/Shell";
import { PageHero } from "@/components/site/PageHero";
import { ContactBody, ContactCard } from "@/components/site/Contact";

export const metadata: Metadata = { title: CONTACT_PAGE.meta.title, description: CONTACT_PAGE.lead };

export default function ContactPage() {
  const C = CONTACT_PAGE;
  return (
    <Shell>
      <main id="main">
        <PageHero
          crumbs={[{ label: "Home", path: "/" }, { label: "Contact", path: "/contacts/" }]}
          eyebrow={C.eyebrow}
          title={C.title}
          lead={C.lead}
          note={C.note}
          aside={<ContactCard />}
        />
        <ContactBody />
      </main>
    </Shell>
  );
}
