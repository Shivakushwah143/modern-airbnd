"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";

type NavigationLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  showPending?: boolean;
};

function PendingHint() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className="navigation-link-pending sr-only" role="status">
      Opening page
    </span>
  ) : null;
}

/** Native Next Link behavior with an accessible pending marker for slow transitions. */
export function NavigationLink({
  children,
  className,
  showPending = true,
  ...props
}: NavigationLinkProps) {
  return (
    <Link {...props} className={`navigation-link ${className || ""}`.trim()}>
      {children}
      {showPending && <PendingHint />}
    </Link>
  );
}
