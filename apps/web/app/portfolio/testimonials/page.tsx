import Link from "next/link";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Testimonial } from "@modern-airbnd/contracts";
import { TestimonialGallery } from "@/components/TestimonialGallery";

export const metadata: Metadata = {
  title: "Owner testimonials",
  description:
    "Owner testimonials with real screenshots and short videos shared through Modern Stayz.",
  alternates: { canonical: "/portfolio/testimonials" },
};

async function load(): Promise<Testimonial[] | null> {
  try {
    const bundle = await api<{ testimonials: Testimonial[] }>("/portfolio");
    return bundle.testimonials;
  } catch {
    return null;
  }
}

export default async function TestimonialsPage() {
  const testimonials = await load();

  return (
    <div className="container section">
      <div className="page-hero-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Testimonials</span>
        </nav>
        <p className="eyebrow">Owner testimonials</p>
        <h1>Owner voices, with their own media</h1>
        <p className="intro">
          Each entry below carries media uploaded by the owner — a real
          screenshot or a short video from their property — alongside their
          words. Nothing here is rewritten.
        </p>
      </div>

      {testimonials === null && (
        <p className="notice error" role="alert">
          The portfolio service is unavailable right now. Please retry shortly.
        </p>
      )}

      {testimonials && testimonials.length > 0 && (
        <TestimonialGallery items={testimonials} />
      )}

      {testimonials && testimonials.length === 0 && (
        <div className="empty-state">
          <h2>No testimonials published yet.</h2>
          <p>
            Owner stories are collected as they come in — check back soon, or
            start the conversation yourself.
          </p>
          <Link className="button primary" href="/owners">
            List your property
          </Link>
        </div>
      )}
    </div>
  );
}