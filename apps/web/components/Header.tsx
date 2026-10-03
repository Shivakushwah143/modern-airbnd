"use client";
import Link from "next/link";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
export function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["/properties", "Properties"],
    ["/locations", "Locations"],
    ["/owners", "List your property"],
    ["/about", "About"],
    ["/contact", "Contact"],
  ];
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Modern Airbnd home">
          <span className="brand-mark">
            <Icon size={25} />
          </span>
          <span>
            Modern <strong>Airbnd</strong>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="button secondary header-contact" href="/contact">
          <Icon name="chat" size={18} />
          Get in touch
        </Link>
        <button
          className="icon-btn mobile-menu"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" />
        </button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Explore Modern Airbnd"
      >
        <nav className="mobile-links">
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </Dialog>
    </header>
  );
}
