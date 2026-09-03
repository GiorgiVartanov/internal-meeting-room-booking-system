import { UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

import { BookingTimeRange } from "./BookingTimeRange"

import type { ReactElement } from "react"

interface IProps {
  title: string
  organizer: string
  start: number | string
  end: number | string
  className?: string
}

/** Keeps essential booking details legible in a single 15-minute timeline row. */
export const CompactBookingDetails = ({
  title,
  organizer,
  start,
  end,
  className,
}: IProps): ReactElement => (
  <div
    className={cn(
      "flex h-full min-w-0 items-center justify-center gap-1 text-[8px] leading-none",
      className
    )}
  >
    <strong className="mr-1 w-fit max-w-[55%] shrink-0 truncate font-semibold">{title}</strong>
    <BookingTimeRange
      start={start}
      end={end}
      className="shrink-0 whitespace-nowrap opacity-75"
    />
    <span className="flex min-w-0 flex-1 items-center truncate opacity-75">
      <UserRound className="mr-0.5 size-2 shrink-0" />
      <span className="truncate">{organizer}</span>
    </span>
  </div>
)
