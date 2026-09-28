"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function Blog() {
  // The three newest posts on the live tmasi.net blog, word for word (titles, place and date line, excerpts).
  // Cards open the live article until the v3 blog pages exist.
  const posts = [
    {
      id: 6,
      title: "TMASI Global Joins the International Travel & Health Insurance Conference (ITIC Global) 2026 as an Official Sponsor",
      date: "Istanbul, Turkey · October 2026",
      image: "/img/news/itic-global-2026-istanbul.jpg",
      href: "https://tmasi.net/blog/news6.php",
      excerpt: "TMASI Global is proud to join the International Travel & Health Insurance Conference (ITIC Global) 2026 in Istanbul as an official sponsor, taking part in one of the leading international gatherings for the travel insurance, medical assistance, and global healthcare industries."
    },
    {
      id: 5,
      title: "TMASI Global Announces Strategic Partnership with Hansa Medica Group at the Grand Egyptian Museum",
      date: "Giza, Egypt · June 2026",
      image: "/img/news/hansa-medica-grand-egyptian-museum-1.jpg",
      href: "https://tmasi.net/blog/news5.php",
      excerpt: "TMASI Global is proud to announce a strategic partnership with Hansa Medica Group, the trusted medical provider serving the Grand Egyptian Museum in Giza, Egypt."
    },
    {
      id: 4,
      title: "TMASI Global Takes the Stage at ITIC Global Venice 2025",
      date: "Venice, Italy · November 2025",
      image: "/img/D917A331-9A8C-436C-AB74-A070CB235C40.PNG",
      href: "https://tmasi.net/blog/news4.php",
      excerpt: "This year, TMASI Global had the honor of taking the stage at the ITIC Global 2025 - International Travel & Health Insurance Conference in Venice, one of the most prestigious global events for the travel and health insurance industry."
    }
  ];

  return (
    <section className="section-blog" id="blog" style={{ padding: "100px 0", background: "#ffffff", position: "relative", zIndex: 1 }}>
      <div className="container">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h2 className="headline-titling" style={{ fontSize: "36px", color: "#0F205C", margin: 0 }}>Latest News &amp; Updates</h2>
            </div>
            <Link href="https://tmasi.net/blog/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--tmasi-teal)", fontWeight: 600, borderBottom: "2px solid transparent", transition: "border-color 0.3s", paddingBottom: "2px" }} className="hover-border">
              View All News &rarr;
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.1}>
              <motion.a 
                href={post.href}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #f1f5f9", background: "#f8fafc", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column", textDecoration: "none" }}
              >
                <div style={{ width: "100%", height: "240px", position: "relative", overflow: "hidden" }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} style={{ width: "100%", height: "100%" }}>
                    <Image src={`/tmasi/v3${post.image}`} alt={post.title} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                </div>
                
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", fontWeight: 500 }}>{post.date}</div>
                  <h3 className="headline-titling" style={{ fontSize: "22px", color: "#0F205C", marginBottom: "12px", lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.6, marginBottom: "20px", flexGrow: 1 }}>{post.excerpt}</p>
                  
                  <div style={{ color: "var(--tmasi-teal)", fontWeight: 700, fontSize: "14px", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    Read more &rarr;
                  </div>
                </div>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
