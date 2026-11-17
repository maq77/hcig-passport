// Local multilingual embeddings (R7): multilingual-e5-small, 384 dimensions, mean pooling, normalised.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = "Xenova/multilingual-e5-small";
const monorepo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

type Extractor = (input: string[], opts: { pooling: "mean"; normalize: boolean }) => Promise<{ tolist(): number[][] }>;
let extractor: Promise<Extractor> | undefined;

function load(): Promise<Extractor> {
  if (!extractor) {
    extractor = (async () => {
      const tf: any = await import("@huggingface/transformers");
      tf.env.cacheDir = process.env.DATA_DIR ? join(resolve(process.env.DATA_DIR), "models") : join(monorepo, "data", "models");
      return (await tf.pipeline("feature-extraction", MODEL, { dtype: "q8" })) as Extractor;
    })();
    extractor.catch(() => {
      extractor = undefined;
    });
  }
  return extractor;
}

async function embed(texts: string[], prefix: string): Promise<number[][]> {
  if (!texts.length) return [];
  const ex = await load();
  const out: number[][] = [];
  const BATCH = 16;
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await ex(
      texts.slice(i, i + BATCH).map((t) => prefix + t),
      { pooling: "mean", normalize: true },
    );
    out.push(...res.tolist());
  }
  return out;
}

export function embedPassages(texts: string[]): Promise<number[][]> {
  return embed(texts, "passage: ");
}

export async function embedQuery(text: string): Promise<number[]> {
  return (await embed([text], "query: "))[0]!;
}
