"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { motion } from "framer-motion";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "The Future of Medical Tourism: Quality & Accessibility",
      category: "Medical Tourism",
      date: "Istanbul, Turkey · October 2026",
      image: "/img/msa.jpg",
      excerpt: "Exploring how global healthcare standards and seamless travel assistance are transforming the patient experience across borders."
    },
    {
      id: 2,
      title: "Ensuring Safety: Repatriation Best Practices",
      category: "Emergency Assistance",
      date: "Cairo, Egypt · September 2026",
      image: "/img/tas.jpg",
      excerpt: "A deep dive into the complex logistics and compassionate care required for successful international medical evacuations."
    },
    {
      id: 3,
      title: "Why Corporate Health Assistance is Essential",
      category: "Corporate Solutions",
      date: "Dubai, UAE · August 2026",
      image: "/img/emc.jpeg",
      excerpt: "How multinational companies are protecting their most valuable assets—their employees—through dedicated medical concierge services."
    }
  ];

  return (
    <section className="section-blog" id="blog" style={{ padding: "100px 0", background: "#ffffff", position: "relative", zIndex: 1 }}>
      <div className="container">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h2 className="headline-titling" style={{ fontSize: "36px", color: "#0F205C", marginBottom: "8px" }}>OUR NEWS</h2>
              <p style={{ color: "#475569", fontSize: "16px" }}>News, updates, and expert articles from TMASI Global.</p>
            </div>
            <Link href="#blog" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--tmasi-teal)", fontWeight: 600, borderBottom: "2px solid transparent", transition: "border-color 0.3s", paddingBottom: "2px" }} className="hover-border">
              View All News &rarr;
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.1}>
              <motion.div 
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #f1f5f9", background: "#f8fafc", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
              >
                <div style={{ width: "100%", height: "240px", position: "relative", overflow: "hidden" }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }} style={{ width: "100%", height: "100%" }}>
                    <Image src={`/tmasi/v3${post.image}`} alt={post.title} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                  <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "var(--tmasi-teal)" }}>
                    {post.category}
                  </div>
                </div>
                
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", fontWeight: 500 }}>{post.date}</div>
                  <h3 className="headline-titling" style={{ fontSize: "22px", color: "#0F205C", marginBottom: "12px", lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.6, marginBottom: "20px", flexGrow: 1 }}>{post.excerpt}</p>
                  
                  <div style={{ color: "var(--tmasi-teal)", fontWeight: 700, fontSize: "14px", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    Read Article &rarr;
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
