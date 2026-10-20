import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingOverlay({
  label = "Saving changes",
}: {
  label?: string;
}) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <LoadingSpinner label={label} />
      <span>{label}</span>
    </div>
  );
}
