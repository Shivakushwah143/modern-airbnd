"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const mode = navMode(pathname);
  const links = NAV_LINKS[mode];
  const ctas = headerCtas(mode);
  const publicHeader = mode !== "admin";

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const closeMenu = () => {
    if (!open || closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimer.current = null;
    }, 180);
  };

  const toggleMenu = () => {
    if (open) closeMenu();
    else {
      setClosing(false);
      setOpen(true);
    }
  };

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
          <NavigationLink
            className="icon-btn header-search"
            href={pathname === "/" ? "#search" : "/stays#search"}
            aria-label="Search stays"
            showPending={false}
          >
            <Icon name="search" size={20} />
          </NavigationLink>
        )}
        {publicHeader && (
          <NavigationLink className="header-quick-contact" href={ctas[0].href} aria-label={ctas[0].label}>
            <Icon name={ctas[0].icon} size={17} />
            <span>{ctas[0].label}</span>
          </NavigationLink>
        )}
        <button
          className="icon-btn mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-controls="mobile-site-menu"
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      <Dialog
        open={open}
        modal={false}
        showCloseButton={false}
        onClose={closeMenu}
        className={`header-menu-dialog ${closing ? "is-closing" : ""}`}
        id="mobile-site-menu"
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
