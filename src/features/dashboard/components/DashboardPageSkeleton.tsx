import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { DashboardCalendarSkeleton } from "./DashboardCalendarSkeleton"

import type { ReactElement } from "react"

/** Preserves the dashboard page structure while its initial data loads. */
export const DashboardPageSkeleton = (): ReactElement => (
  <main className="h-[calc(100dvh-4rem)] w-full overflow-hidden p-2">
    <div className="h-full min-h-0 border">
      <Card className="h-full min-h-0 w-full gap-0 bg-panel p-0">
        <CardContent className="h-full min-h-0 overflow-hidden p-2">
          <div className="mb-3 grid min-h-12 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
            <div />
            <div className="flex items-center gap-2">
              <Skeleton className="size-9" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="size-9" />
            </div>
            <Skeleton className="ml-auto h-8 w-36" />
          </div>
          <DashboardCalendarSkeleton />
        </CardContent>
      </Card>
    </div>
  </main>
)
