import { Skeleton } from "@/components/ui/skeleton"
import i18n from "@/i18n"

/** Displays route-level loading feedback during lazy page imports. */
const LoadingPage = () => (
  <main
    aria-busy="true"
    aria-label={i18n.t("loadingPage")}
    className="mx-auto min-h-screen max-w-7xl p-6"
  >
    <span className="sr-only">{i18n.t("loading")}</span>
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-64" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-44 w-full"
        />
      ))}
    </div>
  </main>
)

export default LoadingPage
