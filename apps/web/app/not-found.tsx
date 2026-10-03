import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section empty-state">
      <p className="eyebrow">404 · NOT FOUND</p>
      <h1>This space isn’t here.</h1>
      <p>
        The property may no longer be published, or the link may have changed.
      </p>
      <Link className="button primary" href="/properties">
        Browse properties
      </Link>
    </div>
  );
}
