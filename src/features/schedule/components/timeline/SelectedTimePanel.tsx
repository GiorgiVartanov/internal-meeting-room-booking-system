import { cn } from "@/lib/utils"

import { BookingTimeRange } from "./BookingTimeRange"

import type { ReactElement } from "react"

interface IProps {
  label: string
  start: string
  end: string
  className?: string
}

/** Summarizes the time range currently selected for a new booking. */
export const SelectedTimePanel = ({ label, start, end, className }: IProps): ReactElement => (
  <div className={cn("min-w-24 border px-2 py-1", className)}>
    <span className="block text-[10px] text-muted-foreground">{label}</span>
    <strong className="text-xs">
      <BookingTimeRange
        start={start}
        end={end}
      />
    </strong>
  </div>
)
