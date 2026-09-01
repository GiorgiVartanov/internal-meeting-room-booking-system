import { isValid, isWeekend, nextMonday, parseISO } from "date-fns"
import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { appCalendarDate, dateKey } from "@/lib/date"
import type { IRoomFilters, TCapacityBucket, TRoomAmenity } from "@/types"

const capacities: TCapacityBucket[] = ["1", "2", "4-8", "9-20"]
const amenities: TRoomAmenity[] = [
  "display",
  "whiteboard",
  "video-conference",
  "speakerphone",
  "standing-desk",
]
const parseList = <T extends string>(value: string | null, allowed: T[]) => {
  const values = (value?.split(",") ?? []).filter((item): item is T =>
    allowed.some((allowedValue) => allowedValue === item)
  )

  return values.length ? values : undefined
}

export const useScheduleUrl = () => {
  const [params, setParams] = useSearchParams()

  const today = appCalendarDate()
  const rawDate = params.get("date") ?? dateKey(isWeekend(today) ? nextMonday(today) : today)
  const parsed = parseISO(rawDate)
  const selectedDate = isValid(parsed) ? parsed : appCalendarDate()

  const filters: IRoomFilters = useMemo(
    () => ({
      search: params.get("roomSearch") ?? undefined,
      capacity: parseList(params.get("capacity"), capacities),
      amenities: parseList(params.get("amenities"), amenities),
      hasAirConditioning: params.get("ac") === "true" || undefined,
      isAccessible: params.get("accessible") === "true" || undefined,
    }),
    [params]
  )
  const update = useCallback(
    (changes: Record<string, string | undefined>) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          Object.entries(changes).forEach(([key, value]) =>
            value ? next.set(key, value) : next.delete(key)
          )

          return next
        },
        { replace: true }
      ),
    [setParams]
  )

  const updateFilters = (next: IRoomFilters) =>
    update({
      roomSearch: next.search,
      capacity: next.capacity?.join(","),
      amenities: next.amenities?.join(","),
      ac: next.hasAirConditioning ? "true" : undefined,
      accessible: next.isAccessible ? "true" : undefined,
    })

  return { params, selectedDate, dateValue: dateKey(selectedDate), filters, update, updateFilters }
}
