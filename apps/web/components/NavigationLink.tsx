"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

type NavigationLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  showPending?: boolean;
};

function PendingHint() {
  const { pending } = useLinkStatus();
  return pending ? (
    <LoadingSpinner className="navigation-link-spinner" label="Opening page" />
  ) : null;
}

/** Native Next Link behavior with an in-link pending hint for slow transitions. */
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
