"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { AsyncButton } from "./AsyncButton";

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
    <AsyncButton
      type="button"
      className={className}
      busy={busy}
      busyLabel="Retrying…"
      onClick={() => startTransition(() => router.refresh())}
    >
      {label}
    </AsyncButton>
  );
}
