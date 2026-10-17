/**
 * Route-aware navigation (FR-006..FR-014, W32 navigation switches).
 *
 * `navMode(pathname)` decides which navigation shell applies:
 *  - "admin"  → admin workspaces (/admin/**)
 *  - "owner"  → portfolio / service-owner surfacing (/portfolio, /services)
 *  - "guest"  → guest booking experiences (/stays/**, /enquiry/**)
 *  - "neutral"→ public browsing (home, /locations, informational pages)
 *
 * The admin mode wins over everything: no guest/owner content leaks into the
 * admin shell, as required by the execution plan (guest content must not run
 * inside /admin).
 */
export type NavMode = "neutral" | "guest" | "owner" | "admin";

export type NavLink = {
  href: string;
  label: string;
  icon: string;
};

export function navMode(pathname: string): NavMode {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (
    pathname === "/stays" ||
    pathname.startsWith("/stays/") ||
    pathname === "/enquiry" ||
    pathname.startsWith("/enquiry/")
  )
    return "guest";
  if (
    pathname === "/portfolio" ||
    pathname.startsWith("/portfolio/") ||
    pathname === "/services"
  )
    return "owner";
  return "neutral";
}

export const NAV_LINKS: Record<NavMode, NavLink[]> = {
  neutral: [
    { href: "/stays", label: "Stays", icon: "bed" },
    { href: "/locations", label: "Destinations", icon: "pin" },
    { href: "/portfolio", label: "For Owners", icon: "home" },
    { href: "/about", label: "About", icon: "shield" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  guest: [
    { href: "/", label: "Explore", icon: "home" },
    { href: "/stays", label: "Stays", icon: "bed" },
    { href: "/locations", label: "Destinations", icon: "pin" },
    { href: "/portfolio", label: "For Owners", icon: "home" },
    { href: "/about", label: "About", icon: "shield" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  owner: [
    { href: "/portfolio", label: "Portfolio", icon: "home" },
    { href: "/services", label: "Services", icon: "shield" },
    { href: "/stays", label: "Live stays", icon: "bed" },
    { href: "/owners", label: "List your property", icon: "plus" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: "home" },
    { href: "/admin/listings", label: "Listings", icon: "bed" },
    { href: "/admin/portfolio", label: "Portfolio", icon: "photo" },
    { href: "/admin/pms", label: "PMS", icon: "calendar" },
    { href: "/admin/cms", label: "CMS", icon: "menu" },
  ],
};

export const BOTTOM_LINKS: Record<NavMode, NavLink[]> = {
  neutral: [
    { href: "/", label: "Explore", icon: "home" },
    { href: "/stays", label: "Stays", icon: "bed" },
    { href: "/locations", label: "Cities", icon: "pin" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  guest: [
    { href: "/", label: "Explore", icon: "home" },
    { href: "/stays", label: "Stays", icon: "bed" },
    { href: "/locations", label: "Cities", icon: "pin" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  owner: [
    { href: "/", label: "Home", icon: "home" },
    { href: "/portfolio", label: "Portfolio", icon: "photo" },
    { href: "/services", label: "Services", icon: "shield" },
    { href: "/contact", label: "Contact", icon: "chat" },
  ],
  admin: [],
};

/** Exact match for "/", prefix match otherwise. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Header call-to-action(s) per mode (right side on desktop and in the menu
 * sheet). Home/neutral surfaces both journeys (70% owner / 30% guest brand
 * positioning): the guest action first, the owner action right beside it. */
export function headerCtas(mode: NavMode): NavLink[] {
  switch (mode) {
    case "owner":
      return [{ href: "/owners", label: "List your property", icon: "plus" }];
    case "admin":
      return [{ href: "/admin", label: "Workspace", icon: "shield" }];
    case "guest":
      // Book a Stay leads straight into the searchable city journey; the
      // contextual Book Now lives on the property itself.
      return [
        { href: "/stays", label: "Book a Stay", icon: "calendar" },
        { href: "/owners", label: "List your property", icon: "plus" },
      ];
    default:
      return [
        { href: "/stays", label: "Book a Stay", icon: "calendar" },
        { href: "/owners", label: "List your property", icon: "plus" },
      ];
  }
}