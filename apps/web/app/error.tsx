"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section empty-state">
      <h1>We couldn’t load this page.</h1>
      <p>Availability could not be confirmed. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link href="/contact" className="button secondary">
        Contact
      </Link>
    </div>
  );
}
