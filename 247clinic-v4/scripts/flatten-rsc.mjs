/* Next 16 static export writes segment payloads as `__next.services/__PAGE__.txt`,
   but the client requests `__next.services.__PAGE__.txt`. Copy each one to the requested
   name so client-side navigation works on a plain static host. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
let n = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) flatten(dir, p, e.name);
    else if (e.name !== "_next") walk(p);
  }
}

function flatten(base, segDir, prefix) {
  for (const e of fs.readdirSync(segDir, { withFileTypes: true })) {
    const p = path.join(segDir, e.name);
    const name = `${prefix}.${e.name}`;
    if (e.isDirectory()) flatten(base, p, name);
    else {
      fs.copyFileSync(p, path.join(base, name));
      n++;
    }
  }
}

walk(OUT);
console.log(`flatten-rsc: ${n} payloads copied`);
