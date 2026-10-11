"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export function PublicBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/properties/")) return null;

  const links = [
    ["/", "Explore", "home"],
    ["/locations", "Destinations", "pin"],
    ["/contact", "Operator", "chat"],
  ];

  return (
    <nav className="public-bottom-nav" aria-label="Guest quick navigation">
      {links.map(([href, label, icon]) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
