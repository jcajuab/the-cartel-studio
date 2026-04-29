import { Skeleton } from "@/components/ui/skeleton";

const KPI_SKELETONS = ["net", "completed", "ticket", "voids", "stock"];

export default function Loading() {
  return (
    <div className="space-y-4 p-4 lg:p-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_SKELETONS.map((item) => (
          <Skeleton className="h-28 rounded-2xl" key={item} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
