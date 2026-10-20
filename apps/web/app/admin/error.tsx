"use client";
import { RouteErrorState } from "@/components/RouteErrorState";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteErrorState
      title="The admin workspace could not be opened."
      reset={reset}
    />
  );
}
