import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { Header } from "@/components/Header";
import Link from "next/link";
import { siteUrl } from "@/lib/api";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Modern Airbnd — Find a stay that feels right",
    template: "%s | Modern Airbnd",
  },
  description:
    "Explore properties, check your dates and enquire directly with the property team.",
  openGraph: {
    siteName: "Modern Airbnd",
    type: "website",
    title: "Modern Airbnd",
    description: "Discover properties. Check availability. Enquire directly.",
  },
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container footer-grid">
            <div>
              <Link href="/" className="brand">
                Modern <strong>Airbnd</strong>
              </Link>
              <p>
                Find your place.
                <br />
                Start a conversation.
              </p>
            </div>
            <nav aria-label="Footer">
              <Link href="/properties">Explore properties</Link>
              <Link href="/about">About us</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <nav aria-label="Policies">
              <Link href="/policies">Stay policies</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
          <div className="container footer-bottom">
            <span>© {new Date().getFullYear()} Modern Airbnd</span>
            <span>Enquiries only. A conversation does not reserve a stay.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
