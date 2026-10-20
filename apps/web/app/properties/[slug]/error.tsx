"use client";
import { RouteErrorState } from "@/components/RouteErrorState";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      title="Property details could not be loaded."
      reset={reset}
    />
  );
}
