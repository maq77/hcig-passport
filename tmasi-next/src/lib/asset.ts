// A file under public/, with the preview's base path in front. Safe to import from client components
// (it pulls in no content).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => (!p || p.startsWith("http") ? p : `${BASE_PATH}${p}`);
