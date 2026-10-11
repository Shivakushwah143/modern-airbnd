"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RetryButton({
  label = "Retry",
  className = "button secondary",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={() => startTransition(() => router.refresh())}
    >
      {busy ? "Retrying..." : label}
    </button>
  );
}
