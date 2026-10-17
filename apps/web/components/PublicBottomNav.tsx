"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { BOTTOM_LINKS, isNavActive, navMode } from "@/lib/nav";

export function PublicBottomNav() {
  const pathname = usePathname();
  const mode = navMode(pathname);

  // Admin workspaces run alone, and PDPs keep their sticky enquiry action.
  if (mode === "admin") return null;
  if (/\/properties\//.test(pathname) || /\/stays\/.+\/.+/.test(pathname))
    return null;

  const links = BOTTOM_LINKS[mode];
  if (!links.length) return null;

  return (
    <nav
      className="public-bottom-nav"
      aria-label="Quick navigation"
      data-nav-mode={mode}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isNavActive(pathname, link.href) ? "page" : undefined}
        >
          <Icon name={link.icon} />
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}