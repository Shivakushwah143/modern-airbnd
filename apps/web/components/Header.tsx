"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";
import { NavigationLink } from "./NavigationLink";
import {
  NAV_LINKS,
  headerCtas,
  isNavActive,
  navMode,
} from "@/lib/nav";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const mode = navMode(pathname);
  const links = NAV_LINKS[mode];
  const ctas = headerCtas(mode);
  const publicHeader = mode !== "admin";

  return (
    <header
      className={`site-header ${publicHeader ? "public-header" : ""} nav-${mode}`}
      data-nav-mode={mode}
    >
      <div className="container header-inner">
        <NavigationLink href="/" className="brand" aria-label="Modern Stayz home" showPending={false}>
          <span className="brand-mark">
            <Icon size={25} />
          </span>
          <span>
            Modern <strong>Stayz</strong>
          </span>
        </NavigationLink>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              aria-current={
                isNavActive(pathname, link.href) ? "page" : undefined
              }
            >
              {link.label}
            </NavigationLink>
          ))}
        </nav>
        <div className="header-ctas">
          {ctas.map((cta, index) => (
            <NavigationLink
              key={cta.href}
              className={`button ${index === 0 ? "primary" : "secondary"} header-contact`}
              href={cta.href}
            >
              <Icon name={cta.icon} size={18} />
              {cta.label}
            </NavigationLink>
          ))}
        </div>
        {publicHeader && (
          <NavigationLink className="header-quick-contact" href={ctas[0].href}>
            <Icon name={ctas[0].icon} size={17} />
            <span>{ctas[0].label}</span>
          </NavigationLink>
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
        <nav className="mobile-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              aria-current={
                isNavActive(pathname, link.href) ? "page" : undefined
              }
              onClick={() => setOpen(false)}
            >
              <Icon name={link.icon} size={18} />
              {link.label}
            </NavigationLink>
          ))}
        </nav>
        {publicHeader && (
          <div className="mobile-cta-row">
            {ctas.map((cta, index) => (
              <NavigationLink
                key={cta.href}
                className={`button ${index === 0 ? "primary" : "secondary"}`}
                href={cta.href}
                onClick={() => setOpen(false)}
              >
                <Icon name={cta.icon} size={18} />
                {cta.label}
              </NavigationLink>
            ))}
          </div>
        )}
      </Dialog>
    </header>
  );
}
