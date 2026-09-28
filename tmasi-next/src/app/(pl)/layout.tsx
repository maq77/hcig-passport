import "../globals.css";
import RootHtml from "@/components/site/RootHtml";

// Root layout for the pl pages: its own <html lang>.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="pl">{children}</RootHtml>;
}
