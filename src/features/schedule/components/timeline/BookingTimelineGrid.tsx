import { useTranslation } from "react-i18next"

import { BOOKING_SLOT_MINUTES } from "@/constants"

import {
  TIMELINE_FIRST_MINUTE,
  TIMELINE_PIXELS_PER_MINUTE,
  TIMELINE_SLOTS,
  timelineTimeText,
} from "../../utils"

import type { ITimelineRange } from "./BookingTimeline"

interface IProps {
  blocked: boolean
  isToday: boolean
  pastOverlayMinute: number
  unavailableRanges?: ITimelineRange[]
  startMinute: number
  endMinute: number
  outsideWindow: (minute: number) => boolean
  available: (start: number, end: number) => boolean
  onRange: (start: string, end: string) => void
}

/** Renders selectable time slots and unavailable regions behind booking cards. */
export const BookingTimelineGrid = ({
  blocked,
  isToday,
  pastOverlayMinute,
  unavailableRanges,
  startMinute,
  endMinute,
  outsideWindow,
  available,
  onRange,
}: IProps) => {
  const { t } = useTranslation()

  return (
    <>
      {TIMELINE_SLOTS.map((minute) => (
        <button
          key={minute}
          type="button"
          disabled={
            blocked || outsideWindow(minute) || !available(minute, minute + BOOKING_SLOT_MINUTES)
          }
          aria-label={`${t("selectStart")} ${timelineTimeText(minute)}`}
          className="absolute left-12 right-0 cursor-default border-t text-left hover:bg-primary/10 disabled:pointer-events-none disabled:bg-muted/20"
          style={{
            top: (minute - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE,
            height: BOOKING_SLOT_MINUTES * TIMELINE_PIXELS_PER_MINUTE,
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ")
              onRange(timelineTimeText(minute), timelineTimeText(minute + BOOKING_SLOT_MINUTES))
          }}
        >
          {minute % 60 === 0 && (
            <span className="absolute right-full -top-2 w-11 pr-2 text-right font-mono text-[10px] text-muted-foreground">
              {timelineTimeText(minute)}
            </span>
          )}
        </button>
      ))}
      {isToday && pastOverlayMinute > TIMELINE_FIRST_MINUTE && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[15] bg-background/45"
          style={{
            top: -8,
            height: (pastOverlayMinute - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE + 8,
          }}
        />
      )}
      {unavailableRanges?.map((range) => (
        <div
          key={`unavailable-${range.start}-${range.end}`}
          role="img"
          aria-label={t("bookedInEveryRoom")}
          className="pointer-events-none absolute left-12 right-1 z-[4] border-y border-destructive/60 bg-destructive/20"
          style={{
            top: (range.start - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE,
            height: Math.max(1, (range.end - range.start) * TIMELINE_PIXELS_PER_MINUTE),
          }}
        />
      ))}
      {!blocked && available(startMinute, endMinute) && (
        <div
          className="pointer-events-none absolute left-12 right-0 z-[5] border border-primary bg-primary/15"
          style={{
            top: (startMinute - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE,
            height:
              Math.max(BOOKING_SLOT_MINUTES, endMinute - startMinute) * TIMELINE_PIXELS_PER_MINUTE,
          }}
        />
      )}
    </>
  )
}
