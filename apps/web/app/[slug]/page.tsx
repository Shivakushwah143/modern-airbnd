import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api, ApiError } from "@/lib/api";

type CmsPageData = {
  slug: string;
  title: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
};

const SLUG = /^[a-z0-9-]{1,80}$/;

async function load(slug: string): Promise<CmsPageData | "error" | null> {
  if (!SLUG.test(slug)) return null;
  try {
    return await api<CmsPageData>(`/cms/pages/${slug}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    return "error";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await load(slug);
  if (!page) notFound();
  if (page === "error")
    return {
      title: "Page unavailable",
      robots: { index: false, follow: false },
    };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await load(slug);
  if (!page) notFound();

  if (page === "error")
    return (
      <div className="container section narrow">
        <p className="notice error" role="alert">
          This page is temporarily unavailable. Please retry shortly.
        </p>
      </div>
    );

  const paragraphs = page.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="container section narrow">
      <p className="eyebrow">Modern Stayz</p>
      <h1>{page.title}</h1>
      {paragraphs.length ? (
        paragraphs.map((paragraph, index) => (
          <p className="prose" key={index}>
            {paragraph}
          </p>
        ))
      ) : (
        <p className="muted">This page has no content yet.</p>
      )}
    </div>
  );
}