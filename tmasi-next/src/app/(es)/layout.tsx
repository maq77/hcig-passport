import "../globals.css";
import RootHtml from "@/components/site/RootHtml";

// Root layout for the es pages: its own <html lang>.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="es">{children}</RootHtml>;
}
