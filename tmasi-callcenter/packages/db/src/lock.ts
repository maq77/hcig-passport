import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Returns the pid of another live process holding the lock file, or null. */
export function lockHolder(lockFile: string): number | null {
  if (!existsSync(lockFile)) return null;
  const pid = Number.parseInt(readFileSync(lockFile, "utf8").trim(), 10);
  if (!Number.isFinite(pid) || pid === process.pid) return null;
  return alive(pid) ? pid : null;
}

/** One process owns the data folder. Throws a clear message when another live process holds it. */
export function acquireLock(lockFile: string): void {
  const holder = lockHolder(lockFile);
  if (holder !== null) {
    throw new Error(
      `The database folder is in use by process ${holder} (probably the dev server). ` +
        `Stop it first, then run this command again.`,
    );
  }
  mkdirSync(dirname(lockFile), { recursive: true });
  writeFileSync(lockFile, String(process.pid));
  const release = () => {
    try {
      if (readFileSync(lockFile, "utf8").trim() === String(process.pid)) rmSync(lockFile);
    } catch {
      /* already gone */
    }
  };
  process.once("exit", release);
  for (const sig of ["SIGINT", "SIGTERM"] as const) process.once(sig, () => (release(), process.exit(0)));
}
