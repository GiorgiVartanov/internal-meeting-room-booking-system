import { appClockMinutes } from "@/lib/date"
import { localize } from "@/lib/localize"
import type { IBooking } from "@/types"

import { TIMELINE_PIXELS_PER_MINUTE } from "./timeline"

export const WEEK_TIMELINE_PIXELS_PER_MINUTE = TIMELINE_PIXELS_PER_MINUTE * 1.25

export interface IOverlapRange {
  start: number
  end: number
}

export interface IPositionedBooking {
  booking: IBooking
  start: number
  end: number
  lane: number
  laneCount: number
}

export type TDragMode = "move" | "resize-start" | "resize-end"

export interface IDragState {
  bookingId: string
  originY: number
  deltaMinutes: number
  mode: TDragMode
}

/** Merges overlapping booking ranges into distinct unavailable intervals. */
export const mergeRanges = (ranges: IOverlapRange[]): IOverlapRange[] =>
  [...ranges]
    .sort((first, second) => first.start - second.start)
    .reduce<IOverlapRange[]>((merged, range) => {
      const previous = merged.at(-1)
      if (previous && range.start <= previous.end) {
        previous.end = Math.max(previous.end, range.end)

        return merged
      }

      return [...merged, { ...range }]
    }, [])

/** Provides stable visual ordering for bookings that occupy the same time range. */
const compareBookingPriority = (first: IBooking, second: IBooking, language: string): number =>
  first.createdAt.localeCompare(second.createdAt) ||
  localize(first.title, language).localeCompare(localize(second.title, language), language, {
    sensitivity: "base",
  }) ||
  first.id.localeCompare(second.id)

/** Assigns overlapping weekly bookings to deterministic horizontal lanes. */
export const positionBookings = (bookings: IBooking[], language: string): IPositionedBooking[] => {
  const sorted = [...bookings].sort(
    (first, second) =>
      first.startAt.localeCompare(second.startAt) || compareBookingPriority(first, second, language)
  )
  const positioned: IPositionedBooking[] = []
  let group: IBooking[] = []
  let groupEnd = -1

  const placeGroup = (): void => {
    const lanes: Array<Array<{ start: number; end: number }>> = []
    const groupItems: Array<Omit<IPositionedBooking, "laneCount">> = []
    for (const booking of [...group].sort((first, second) =>
      compareBookingPriority(first, second, language)
    )) {
      const start = appClockMinutes(booking.startAt)
      const end = appClockMinutes(booking.endAt)
      const minimumLane = groupItems.reduce(
        (minimum, item) =>
          start < item.end && end > item.start ? Math.max(minimum, item.lane + 1) : minimum,
        0
      )
      let lane = minimumLane
      while (lanes[lane]?.some((item) => start < item.end && end > item.start)) lane += 1
      const laneItems = lanes[lane] ?? []
      lanes[lane] = laneItems
      laneItems.push({ start, end })
      groupItems.push({ booking, start, end, lane })
    }
    const laneCount = Math.max(1, lanes.length)
    positioned.push(...groupItems.map((item) => ({ ...item, laneCount })))
  }

  sorted.forEach((booking) => {
    const start = appClockMinutes(booking.startAt)
    const end = appClockMinutes(booking.endAt)
    if (group.length && start >= groupEnd) {
      placeGroup()
      group = []
      groupEnd = -1
    }
    group.push(booking)
    groupEnd = Math.max(groupEnd, end)
  })
  if (group.length) placeGroup()

  return positioned
}

/** Finds time intervals where an employee has conflicting bookings. */
export const overlapRanges = (bookings: IBooking[]): IOverlapRange[] => {
  const ranges: IOverlapRange[] = []
  bookings.forEach((booking, index) => {
    bookings.slice(index + 1).forEach((other) => {
      const start = Math.max(appClockMinutes(booking.startAt), appClockMinutes(other.startAt))
      const end = Math.min(appClockMinutes(booking.endAt), appClockMinutes(other.endAt))
      if (start < end && !ranges.some((range) => range.start === start && range.end === end))
        ranges.push({ start, end })
    })
  })

  return ranges
}
