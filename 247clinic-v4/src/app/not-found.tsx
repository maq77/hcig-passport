import { WaButton } from "@/components/ui/Buttons";
import { PageHero } from "@/components/page/Page";
import { BRIEF } from "@/content/brief";
import { BASE } from "@/data/facts";

/* A real 404. It still offers help first. v6: the quiet hero. */
export default function NotFound() {
  return (
    <PageHero quiet eyebrow="404" title={BRIEF.needHelp}>
      <WaButton placement="404">{BRIEF.waUs}</WaButton>
      <a className="btn btn-secondary" href={`${BASE}/`}>24/7 Clinic</a>
    </PageHero>
  );
}
