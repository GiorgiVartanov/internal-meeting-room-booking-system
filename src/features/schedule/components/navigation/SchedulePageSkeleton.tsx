import { Skeleton } from "@/components/ui/skeleton"

import type { ReactElement } from "react"

const timelineSlots = Array.from({ length: 37 }, (_, index) => index)
const bookingPlaceholders = [
  { top: 76, height: 70 },
  { top: 196, height: 104 },
  { top: 356, height: 74 },
  { top: 520, height: 116 },
  { top: 690, height: 84 },
] as const

/** Returns deterministic geometry for a schedule booking placeholder. */
const bookingPlaceholderAt = (index: number): { top: number; height: number } =>
  bookingPlaceholders[index % bookingPlaceholders.length] ?? { top: 76, height: 70 }

/** Mirrors the room-booking page layout while schedule data is loading. */
export const SchedulePageSkeleton = (): ReactElement => (
  <main
    className="flex h-[calc(100dvh-4rem)] min-h-0 w-full flex-col gap-3 overflow-hidden p-2"
    aria-busy="true"
    aria-label="Loading schedule"
  >
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
      <Skeleton className="h-7 w-48 sm:w-64" />
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Skeleton className="size-9" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="size-9" />
        <Skeleton className="size-9 sm:w-28" />
      </div>
    </header>
    <div
      className="min-h-0 flex-1 overflow-hidden border bg-card"
      aria-hidden="true"
    >
      <div className="grid grid-cols-5 gap-1 border-b p-2 md:hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-11"
          />
        ))}
      </div>

      <div className="md:hidden">
        <div className="space-y-2 border-b p-3 text-center">
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto h-3 w-14" />
        </div>
        <div className="relative h-[900px] py-3">
          {timelineSlots.map((slot) => (
            <div
              key={slot}
              className="absolute left-10 right-0 border-t"
              style={{ top: 12 + slot * 22 }}
            >
              {slot % 4 === 0 && <Skeleton className="absolute -left-9 -top-1.5 h-3 w-7" />}
            </div>
          ))}
          {bookingPlaceholders.slice(0, 4).map(({ top, height }, index) => (
            <Skeleton
              key={top}
              className="absolute left-12 right-3 border border-primary/60 bg-[var(--booking-other)]"
              style={{ top, height: index === 1 ? height + 12 : height }}
            />
          ))}
        </div>
      </div>

      <div className="hidden grid-cols-5 md:grid">
        {Array.from({ length: 5 }, (_, dayIndex) => (
          <section
            key={dayIndex}
            className="min-w-0 border-r last:border-r-0"
          >
            <div className="space-y-2 border-b p-3 text-center">
              <Skeleton className="mx-auto h-4 w-20" />
              <Skeleton className="mx-auto h-3 w-12" />
            </div>
            <div className="relative h-[900px] py-3">
              {timelineSlots.map((slot) => (
                <div
                  key={slot}
                  className="absolute left-10 right-0 border-t"
                  style={{ top: 12 + slot * 22 }}
                >
                  {slot % 4 === 0 && <Skeleton className="absolute -left-9 -top-1.5 h-3 w-7" />}
                </div>
              ))}
              {[bookingPlaceholderAt(dayIndex), bookingPlaceholderAt(dayIndex + 2)].map(
                ({ top, height }, bookingIndex) => (
                  <Skeleton
                    key={`${top}-${bookingIndex}`}
                    className={
                      bookingIndex === 0
                        ? "absolute left-12 right-2 border border-primary/60 bg-[var(--booking-own)]"
                        : "absolute left-12 right-2 border border-primary/60 bg-[var(--booking-other)]"
                    }
                    style={{ top: top + bookingIndex * 48, height }}
                  />
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  </main>
)
