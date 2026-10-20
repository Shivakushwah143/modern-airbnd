"use client";

import { useTransition } from "react";
import { AsyncButton } from "./AsyncButton";

export function RouteErrorState({
  title = "This page could not be loaded.",
  reset,
}: {
  title?: string;
  reset: () => void;
}) {
  const [busy, startTransition] = useTransition();
  return (
    <div className="container section empty-state" role="alert">
      <h1>{title}</h1>
      <p>
        Nothing has been reserved or changed. Please retry, or contact the team
        if this continues.
      </p>
      <AsyncButton
        busy={busy}
        busyLabel="Retrying…"
        onClick={() => startTransition(reset)}
      >
        Try again
      </AsyncButton>
    </div>
  );
}
