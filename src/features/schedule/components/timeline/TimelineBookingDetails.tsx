import { UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

import { BookingTimeRange } from "./BookingTimeRange"
import { CompactBookingDetails } from "./CompactBookingDetails"

import type { ReactElement } from "react"

interface IProps {
  title: string
  organizer: string
  start: number | string
  end: number | string
  compact?: boolean
  room?: string
  roomInline?: boolean
  badge?: string
}

/** Renders booking identity and timing consistently across timeline card variants. */
export const TimelineBookingDetails = ({
  title,
  organizer,
  start,
  end,
  compact = false,
  room,
  roomInline = false,
  badge,
}: IProps): ReactElement => (
  <div
    className={cn(
      "pointer-events-none relative z-10",
      compact && "flex h-full items-center gap-1 pr-8"
    )}
  >
    {badge && !compact && (
      <span className="absolute right-1 top-1 bg-secondary/90 px-1 text-[8px] font-semibold uppercase tracking-wide text-primary">
        {badge}
      </span>
    )}
    {compact ? (
      <CompactBookingDetails
        title={title}
        organizer={organizer}
        start={start}
        end={end}
        className="pr-8"
      />
    ) : (
      <>
        <strong className="block truncate pr-12 text-[11px]">{title}</strong>
        <span className="flex min-w-0 items-center gap-1 truncate text-[9px] opacity-75">
          <BookingTimeRange
            start={start}
            end={end}
            className="shrink-0"
          />
          <span aria-hidden>·</span>
          <span className="flex min-w-0 items-center gap-1 truncate">
            <UserRound className="size-2.5 shrink-0" />
            <span className="truncate">{organizer}</span>
          </span>
          {room && roomInline && (
            <span className="inline-flex min-w-0 max-w-[40%] truncate border border-primary/30 bg-primary/10 px-1 font-medium text-primary">
              {room}
            </span>
          )}
        </span>
        {room && !roomInline && (
          <span className="mt-0.5 inline-flex w-fit max-w-full truncate border border-primary/30 bg-primary/10 px-1 text-[9px] font-medium text-primary">
            {room}
          </span>
        )}
      </>
    )}
  </div>
)
