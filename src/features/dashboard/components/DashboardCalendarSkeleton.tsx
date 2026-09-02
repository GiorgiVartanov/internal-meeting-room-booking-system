import { Skeleton } from "@/components/ui/skeleton"

import type { ReactElement } from "react"

/** Mirrors the dashboard calendar geometry while its data is loading. */
export const DashboardCalendarSkeleton = (): ReactElement => (
  <div
    className="calendar-desktop-gutter mx-auto flex h-auto w-full max-w-[1200px] flex-col gap-2 lg:min-w-[840px]"
    aria-hidden="true"
  >
    <div className="grid shrink-0 grid-cols-7 gap-2">
      {Array.from({ length: 7 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-7"
        />
      ))}
    </div>
    <div className="grid aspect-[7/6] min-h-0 grid-cols-7 grid-rows-6 gap-2 lg:aspect-[2/1]">
      {Array.from({ length: 42 }, (_, index) => (
        <Skeleton key={index} />
      ))}
    </div>
  </div>
)
