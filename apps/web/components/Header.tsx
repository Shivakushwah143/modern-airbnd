"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import {
  NAV_LINKS,
  headerCta,
  isNavActive,
  navMode,
} from "@/lib/nav";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const mode = navMode(pathname);
  const links = NAV_LINKS[mode];
  const cta = headerCta(mode);
  const publicHeader = mode !== "admin";

  return (
    <header
      className={`site-header ${publicHeader ? "public-header" : ""} nav-${mode}`}
      data-nav-mode={mode}
    >
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Modern Stayz home">
          <span className="brand-mark">
            <Icon size={25} />
          </span>
          <span>
            Modern <strong>Stayz</strong>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isNavActive(pathname, link.href) ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="button secondary header-contact" href={cta.href}>
          <Icon name={cta.icon} size={18} />
          {cta.label}
        </Link>
        {publicHeader && (
          <Link className="header-quick-contact" href={cta.href}>
            <Icon name={cta.icon} size={17} />
            <span>{cta.label}</span>
          </Link>
        )}
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
        title={
          mode === "admin"
            ? "Admin workspaces"
            : mode === "owner"
              ? "Modern Stayz for owners"
              : "Explore Modern Stayz"
        }
      >
        <nav className="mobile-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isNavActive(pathname, link.href) ? "page" : undefined
              }
              onClick={() => setOpen(false)}
            >
              <Icon name={link.icon} size={18} />
              {link.label}
            </Link>
          ))}
        </nav>
      </Dialog>
    </header>
  );
}