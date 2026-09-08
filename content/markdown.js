/**
 * A small, dependency-free Markdown renderer.
 *
 * Deliberately narrow: it covers exactly what the briefs, audits and plans in
 * this repo actually use - headings, lists, tables, code, quotes, rules, links,
 * emphasis. It is not a CommonMark implementation and does not try to be.
 *
 * All text is escaped before any inline markup is applied, so a document can
 * never inject markup into the portal.
 */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Code spans are lifted out first so their contents are never re-parsed as
   emphasis or links. The sentinel is a control character, which cannot occur
   in any of the source documents. */
const OPEN = String.fromCharCode(2);
const CLOSE = String.fromCharCode(3);

function inline(s) {
  const code = [];
  let t = esc(s).replace(/`([^`]+)`/g, (m, c) => OPEN + (code.push(c) - 1) + CLOSE);

  t = t
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => {
      const ext = /^https?:/i.test(href);
      return `<a href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${txt}</a>`;
    })
    .replace(
      /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      (m, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    )
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?])/g, '$1<em>$2</em>');

  return t.replace(new RegExp(OPEN + '(\\d+)' + CLOSE, 'g'), (m, i) => `<code>${code[Number(i)]}</code>`);
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

/**
 * @returns {{ html: string, title: string|null, toc: {level:number,text:string,id:string}[] }}
 */
function render(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  const toc = [];
  let title = null;
  let i = 0;

  const isTableRule = (l) => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(l) && l.includes('-');
  const cells = (l) =>
    l
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    /* fenced code */
    if (/^\s*```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    /* thematic rule */
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    /* heading. The first h1 becomes the page title rather than body content. */
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\s*#+\s*$/, '');
      const id = slug(text);
      if (level === 1 && !title) { title = text.replace(/[*_`]/g, ''); i++; continue; }
      toc.push({ level, text: text.replace(/[*_`]/g, ''), id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    /* table */
    if (line.includes('|') && i + 1 < lines.length && isTableRule(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) body.push(cells(lines[i++]));
      out.push(
        `<div class="table-scroll"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>` +
          `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      );
      continue;
    }

    /* blockquote */
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${render(buf.join('\n')).html}</blockquote>`);
      continue;
    }

    /* list, one level, ordered or not */
    const li = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
    if (li) {
      const ordered = /\d/.test(li[1]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/);
        if (!m) {
          // an indented continuation line belongs to the item above it
          if (items.length && /^\s{2,}\S/.test(lines[i])) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
          break;
        }
        items.push(m[1]);
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    /* paragraph */
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*>|\s*```|\s*(-{3,}|\*{3,}|_{3,})\s*$)/.test(lines[i]) &&
      !/^\s*(?:[-*+]|\d+[.)])\s+/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (buf.length) out.push(`<p>${inline(buf.join('\n'))}</p>`);
    else i++;
  }

  return { html: out.join('\n'), title, toc };
}

module.exports = { render };
