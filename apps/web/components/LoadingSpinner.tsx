import type { HTMLAttributes } from "react";

export function LoadingSpinner({
  className = "",
  label = "Loading",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label?: string }) {
  return (
    <span
      {...props}
      className={`loading-spinner ${className}`.trim()}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
