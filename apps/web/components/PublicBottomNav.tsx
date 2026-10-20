"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { NavigationLink } from "./NavigationLink";
import { BOTTOM_LINKS, isNavActive, navMode } from "@/lib/nav";

export function PublicBottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const mode = navMode(pathname);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setHidden(false);

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      if (currentY < 24) setHidden(false);
      else if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Admin workspaces run alone, and PDPs keep their sticky enquiry action.
  if (mode === "admin") return null;
  if (/\/properties\//.test(pathname) || /\/stays\/.+\/.+/.test(pathname))
    return null;

  const links = BOTTOM_LINKS[mode];
  if (!links.length) return null;

  return (
    <nav
      className={`public-bottom-nav ${hidden ? "is-hidden" : ""}`}
      aria-label="Quick navigation"
      data-nav-mode={mode}
    >
      {links.map((link) => (
        <NavigationLink
          key={link.href}
          href={link.href}
          aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
        >
          <Icon name={link.icon} />
          <span>{link.label}</span>
        </NavigationLink>
      ))}
    </nav>
  );
}
