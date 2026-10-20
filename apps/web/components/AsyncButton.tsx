"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export function AsyncButton({
  busy = false,
  busyLabel = "Working…",
  children,
  disabled,
  className = "button primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  busyLabel?: ReactNode;
}) {
  return (
    <button
      {...props}
      className={className}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      data-busy={busy || undefined}
    >
      {busy && (
        <LoadingSpinner
          label={typeof busyLabel === "string" ? busyLabel : "Working"}
        />
      )}
      <span>{busy ? busyLabel : children}</span>
    </button>
  );
}
