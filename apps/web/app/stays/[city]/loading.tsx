import { ListingGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <main className="container section">
      <ListingGridSkeleton />
    </main>
  );
}
