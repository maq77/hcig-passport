import { createReadStream, existsSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { dataDir } from "@tc/db";
import { requireCall } from "../../../../../lib/server/calls.ts";
import { handle, HttpError } from "../../../../../lib/server/http.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The recording of one call (only exists when the caller agreed). Supports Range so the player can seek. */
export const GET = handle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const call = await requireCall(id);
  if (!call.recordingPath) throw new HttpError(404, "No recording for this call");
  const root = resolve(dataDir());
  const abs = resolve(join(root, call.recordingPath));
  if (!abs.startsWith(root + sep) || !existsSync(abs)) throw new HttpError(404, "Recording file not found");
  const size = statSync(abs).size;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  const headers: Record<string, string> = { "content-type": "audio/mpeg", "accept-ranges": "bytes", "cache-control": "private, no-store" };
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end) return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    const body = Readable.toWeb(createReadStream(abs, { start, end })) as unknown as ReadableStream;
    return new Response(body, { status: 206, headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(end - start + 1) } });
  }
  const body = Readable.toWeb(createReadStream(abs)) as unknown as ReadableStream;
  return new Response(body, { status: 200, headers: { ...headers, "content-length": String(size) } });
});
