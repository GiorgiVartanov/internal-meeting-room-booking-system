import { cn } from "@/lib/utils"

import { timelineTimeText } from "../../utils"

import type { ReactElement } from "react"

interface IProps {
  start: number | string
  end: number | string
  className?: string
}

/** Normalizes a minute offset or formatted time into display text. */
const timeText = (value: number | string): string =>
  typeof value === "number" ? timelineTimeText(value) : value

/** Displays a booking's start and end times in a compact accessible range. */
export const BookingTimeRange = ({ start, end, className }: IProps): ReactElement => (
  <span className={cn("font-mono", className)}>
    {timeText(start)} - {timeText(end)}
  </span>
)
