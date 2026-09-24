/* npm run edit: the save server and the dev site together. Open
   http://localhost:3000/247clinic/v3?edit=1 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const server = spawn(process.execPath, [join(here, "server.mjs")], { stdio: "inherit" });
const next = spawn("npx", ["next", "dev", "--port", "3000"], { stdio: "inherit", shell: true, cwd: join(here, "..") });

const stop = () => { server.kill(); next.kill(); process.exit(); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", stop);
