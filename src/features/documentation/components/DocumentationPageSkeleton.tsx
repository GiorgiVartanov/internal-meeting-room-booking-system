import { Skeleton } from "@/components/ui/skeleton"

/** Preserves the documentation page structure while the guide content loads. */
export const DocumentationPageSkeleton = () => (
  <main
    className="h-[calc(100dvh-4rem)] overflow-y-auto"
    aria-busy="true"
    aria-label="Loading documentation"
  >
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-4">
          {[88, 116, 104].map((width) => (
            <div
              key={width}
              className="space-y-2"
            >
              <Skeleton
                className="h-4"
                style={{ width }}
              />
              <div className="space-y-2 border-l pl-3">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="min-w-0 space-y-10">
        <header className="space-y-3 border-b pb-6">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-5/6 max-w-2xl" />
          <Skeleton className="h-20 w-full max-w-3xl" />
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="space-y-3 border bg-background p-4"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </section>
        {[0, 1].map((item) => (
          <section
            key={item}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="space-y-px border bg-background p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  </main>
)
