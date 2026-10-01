"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { useSite } from "./site/SiteProvider";
import { asset } from "@/lib/asset";
import { ArrowRight } from "lucide-react";

// News cards in this language, newest first: the live blog's own titles, datelines and excerpts
// (German and Polish: the translated drafts). On the home: the three newest. On the blog page: all,
// under the page's own heading.
export default function Blog({ page = false }: { page?: boolean }) {
  const { ui, links, posts: all } = useSite();
  const posts = (page ? all : all.slice(0, 3)).map((p) => ({ ...p, id: p.key, href: links.posts[p.key] }));
  if (!posts.length) return null;
  const heading = ui.latestNews;

  return (
    <section className="section-blog lx-section lx-white" id="blog">
      <div className="lx-wrap">
        {/* On the blog page the page hero already carries the title. */}
        {!page && (
          <Reveal>
            <SectionHead title={heading} />
          </Reveal>
        )}

        <div className="news-grid">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.08} className="news-cell">
              <Link href={post.href} className="news-card">
                <div className="news-img">
                  <Image src={asset(post.image)} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                </div>
                <div className="news-body">
                  <p className="news-date">{post.cardDate}</p>
                  <h3 className="news-title">{post.title}</h3>
                  <p className="news-excerpt">{post.excerpt}</p>
                  <span className="news-more">{ui.readMore} <ArrowRight size={15} aria-hidden="true" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {!page && links.blog && (
          <div className="lx-more-row">
            <Link href={links.blog} className="lx-more">
              {ui.viewAllNews} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(20px, 2.2vw, 28px); }
        .news-cell { display: flex; }
        .news-card {
          display: flex; flex-direction: column; width: 100%; overflow: hidden; text-decoration: none;
          background: #ffffff; border: 1px solid var(--lx-line); border-radius: var(--lx-radius);
          transition: transform .35s var(--ease), box-shadow .35s var(--ease), border-color .35s ease;
        }
        .news-card:hover { transform: translateY(-4px); box-shadow: var(--lx-lift); border-color: rgba(0,154,156,0.35); }
        .news-img { position: relative; aspect-ratio: 4 / 3; overflow: hidden; background: var(--lx-surface); }
        .news-img img { transition: transform .6s var(--ease); }
        .news-card:hover .news-img img { transform: scale(1.04); }
        .news-body { display: flex; flex-direction: column; flex-grow: 1; padding: clamp(22px, 2vw, 28px); }
        .news-date { margin: 0 0 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--tmasi-teal); }
        .news-title {
          margin: 0 0 12px; font-size: 18px; font-weight: 700; line-height: 1.4; color: var(--lx-ink); letter-spacing: -0.01em;
          display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
        }
        .news-excerpt {
          margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: var(--lx-body);
          display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden;
        }
        .news-more { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--tmasi-teal); margin-top: auto; }

        @media (max-width: 960px) { .news-grid { grid-template-columns: repeat(2, 1fr); } .news-cell:last-child { grid-column: 1 / -1; max-width: calc(50% - 10px); justify-self: center; } }
        @media (max-width: 640px) { .news-grid { grid-template-columns: 1fr; } .news-cell:last-child { max-width: none; } }
      `}} />
    </section>
  );
}

