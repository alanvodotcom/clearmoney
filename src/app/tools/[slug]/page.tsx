import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { toolComponents } from "@/components/calculators/registry";
import { getTool, tools } from "@/lib/content/taxonomy";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool" };
  return { title: tool.title, description: tool.description };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  const Component = toolComponents[slug];
  if (!tool || !Component) notFound();

  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-10 sm:px-6">
      <Component />
    </main>
  );
}
