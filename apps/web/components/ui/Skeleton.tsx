import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`skeleton ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
