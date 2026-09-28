import { SitePage, siteMetadata } from "@/components/site/SitePage";
import { staticParams } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return staticParams("es");
}
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return siteMetadata("es", slug);
}
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  return <SitePage lang="es" slug={slug} />;
}
