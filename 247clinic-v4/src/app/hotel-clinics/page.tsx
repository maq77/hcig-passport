/* The Hotel Clinic Concept is not a page any more (the user, 2026-11-12): its content is the
   #model section of For Hotels & Partners. This address forwards there; at go-live it is a
   301 (specs/007-247clinic-v3/contracts/urls.md). */
import type { Metadata } from "next";
import { BASE } from "@/data/facts";

const TO = `${BASE}/for-hotels#model`;
export const metadata: Metadata = { title: "Hotel Clinic Concept | 24/7 Clinic", robots: { index: false, follow: true } };

export default function HotelClinics() {
  return (
    <section className="section">
      <meta httpEquiv="refresh" content={`0; url=${TO}`} />
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="h2">Hotel Clinic Concept</h1>
        <p className="lead" style={{ margin: "16px auto 0" }}><a className="link" href={TO}><span>For Hotels &amp; Partners</span></a></p>
      </div>
    </section>
  );
}
