import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { Header } from "@/components/Header";
import { PublicBottomNav } from "@/components/PublicBottomNav";
import Link from "next/link";
import { siteUrl } from "@/lib/api";
import { DevAgentation } from "@/components/DevAgentation";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Modern Stayz — Find a stay that feels right",
    template: "%s | Modern Stayz",
  },
  description:
    "Explore properties, check your dates and enquire directly with the property team.",
  openGraph: {
    siteName: "Modern Stayz",
    type: "website",
    title: "Modern Stayz",
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
                Modern <strong>Stayz</strong>
              </Link>
              <p>
                Find your place.
                <br />
                Start a conversation.
              </p>
            </div>
            <nav aria-label="Footer">
              <Link href="/stays">Explore stays</Link>
              <Link href="/locations">Destinations</Link>
              <Link href="/portfolio">Owner portfolio</Link>
              <Link href="/services">Our services</Link>
            </nav>
            <nav aria-label="Company">
              <Link href="/about">About us</Link>
              <Link href="/owners">List your property</Link>
              <Link href="/contact">Contact</Link>
            </nav>
            <nav aria-label="Policies">
              <Link href="/policies">Stay policies</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
          <div className="container footer-bottom">
            <span>© {new Date().getFullYear()} Modern Stayz</span>
            <span>Enquiries only. A conversation does not reserve a stay.</span>
          </div>
        </footer>
        <PublicBottomNav />
        <DevAgentation />
      </body>
    </html>
  );
}
