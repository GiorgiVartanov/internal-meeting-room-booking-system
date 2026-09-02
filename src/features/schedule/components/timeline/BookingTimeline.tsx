import { addMonths, subMinutes } from "date-fns"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  ALLOW_BOOKING_DRAG_AND_RESIZE,
  BOOKING_HORIZON_MONTHS,
  BOOKING_PAST_GRACE_MINUTES,
  BOOKING_SLOT_MINUTES,
  DEFAULT_EMPLOYEE_ID,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  WORKING_HOURS,
} from "@/constants"
import { appClockMinutes, appDateKey, fromDateAndTime } from "@/lib/date"
import { useTimelineNow } from "@/hooks"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBooking, IEmployee } from "@/types"

import { useTimelineBookingDrag } from "../../hooks"
import {
  TIMELINE_DAY_MINUTES,
  TIMELINE_FIRST_MINUTE,
  TIMELINE_PIXELS_PER_MINUTE,
  type IDragState,
  bookingParticipationClassName,
  timelineTimeText,
} from "../../utils"
import { BookingCardActions } from "../booking"

import { BookingResizeHandles } from "./BookingResizeHandles"
import { BookingTimelineGrid } from "./BookingTimelineGrid"
import { BookingTimeRange } from "./BookingTimeRange"
import { CompactBookingDetails } from "./CompactBookingDetails"

import type { RefObject } from "react"

export interface ITimelineRange {
  start: number
  end: number
}

interface IProps {
  date: string
  bookings: IBooking[]
  unavailableRanges?: ITimelineRange[]
  canSelectRange?: (start: number, end: number) => boolean
  employees: IEmployee[]
  start: string
  end: string
  blocked: boolean
  selectedBookingId?: string
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  onRange: (start: string, end: string) => void
  onBooking: (booking: IBooking) => void
  onClearBooking: () => void
  onEdit: (booking: IBooking) => void
  onDelete: (booking: IBooking) => void
  onReschedule: (booking: IBooking, start: string, end: string) => Promise<void>
}

/** Displays and edits one room's bookings on a vertically scaled daily timeline. */
export const BookingTimeline = ({
  date,
  bookings,
  unavailableRanges,
  canSelectRange,
  employees,
  start,
  end,
  blocked,
  selectedBookingId,
  scrollContainerRef,
  onRange,
  onBooking,
  onClearBooking,
  onEdit,
  onDelete,
  onReschedule,
}: IProps) => {
  const { i18n } = useTranslation()
  const now = useTimelineNow()
  const dragStart = useRef<number | undefined>(undefined)
  const dragRange = useRef<string | undefined>(undefined)
  const timelineRef = useRef<HTMLDivElement>(null)
  const nowLineRef = useRef<HTMLDivElement>(null)
  const previousDateRef = useRef(date)
  const hasScrolledToNowRef = useRef(false)
  const { drag, startDrag, moveDrag, finishDrag, cancelDrag, shouldOpenBooking } =
    useTimelineBookingDrag()
  const [pendingRanges, setPendingRanges] = useState<
    Record<string, { start: number; end: number }>
  >({})

  const startMinute = Number(start.slice(0, 2)) * 60 + Number(start.slice(3))
  const endMinute = Number(end.slice(0, 2)) * 60 + Number(end.slice(3))
  const dayEnd = TIMELINE_FIRST_MINUTE + TIMELINE_DAY_MINUTES

  const outsideWindow = (minute: number) => {
    const instant = new Date(fromDateAndTime(date, timelineTimeText(minute)))

    return (
      instant < subMinutes(now, BOOKING_PAST_GRACE_MINUTES) ||
      instant > addMonths(now, BOOKING_HORIZON_MONTHS)
    )
  }

  const available = (rangeStart: number, rangeEnd: number, ignoredId?: string) =>
    !blocked &&
    rangeEnd - rangeStart >= MIN_BOOKING_DURATION_MINUTES &&
    rangeEnd - rangeStart <= MAX_BOOKING_DURATION_MINUTES &&
    !outsideWindow(rangeStart) &&
    (ignoredId !== undefined || (canSelectRange?.(rangeStart, rangeEnd) ?? true)) &&
    !unavailableRanges?.some((range) => rangeStart < range.end && rangeEnd > range.start) &&
    !bookings.some(
      (booking) =>
        booking.id !== ignoredId &&
        booking.status === "confirmed" &&
        rangeStart < appClockMinutes(booking.endAt) &&
        rangeEnd > appClockMinutes(booking.startAt)
    )

  const pointerMinute = (event: React.PointerEvent<HTMLDivElement>) =>
    Math.max(
      TIMELINE_FIRST_MINUTE,
      Math.min(
        dayEnd - BOOKING_SLOT_MINUTES,
        TIMELINE_FIRST_MINUTE +
          Math.floor(
            (event.clientY - event.currentTarget.getBoundingClientRect().top) /
              (TIMELINE_PIXELS_PER_MINUTE * BOOKING_SLOT_MINUTES)
          ) *
            BOOKING_SLOT_MINUTES
      )
    )
  const startSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-timeline-scroll-gutter]")) return
    if ((event.target as HTMLElement).closest("[data-booking]")) return
    if (selectedBookingId) onClearBooking()
    const minute = pointerMinute(event)
    if (!available(minute, minute + BOOKING_SLOT_MINUTES)) {
      onRange("", "")

      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = minute
    dragRange.current = `${minute}:${minute + BOOKING_SLOT_MINUTES}`
    onRange(timelineTimeText(minute), timelineTimeText(minute + BOOKING_SLOT_MINUTES))
  }
  const moveSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === undefined) return
    const minute = pointerMinute(event)
    const rangeStart = Math.min(dragStart.current, minute)
    const rangeEnd = Math.max(dragStart.current, minute) + BOOKING_SLOT_MINUTES
    const nextDragRange = `${rangeStart}:${rangeEnd}`
    if (dragRange.current === nextDragRange) return
    dragRange.current = nextDragRange
    if (available(rangeStart, rangeEnd))
      onRange(timelineTimeText(rangeStart), timelineTimeText(rangeEnd))
  }
  const finishSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== undefined) moveSelection(event)
    dragStart.current = undefined
    dragRange.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const displayedRange = (bookingStart: number, bookingEnd: number, currentDrag?: IDragState) => {
    if (!currentDrag) return { displayStart: bookingStart, displayEnd: bookingEnd }
    if (currentDrag.mode === "resize-start")
      return { displayStart: bookingStart + currentDrag.deltaMinutes, displayEnd: bookingEnd }
    if (currentDrag.mode === "resize-end")
      return { displayStart: bookingStart, displayEnd: bookingEnd + currentDrag.deltaMinutes }

    return {
      displayStart: bookingStart + currentDrag.deltaMinutes,
      displayEnd: bookingEnd + currentDrag.deltaMinutes,
    }
  }

  const pointerTimelineY = (clientY: number): number =>
    clientY - (timelineRef.current?.getBoundingClientRect().top ?? 0)

  const currentMinute = appClockMinutes(now)
  const isToday = appDateKey(now) === date
  const pastOverlayMinute = Math.max(TIMELINE_FIRST_MINUTE, Math.min(dayEnd, currentMinute))
  const showNow =
    isToday && currentMinute >= TIMELINE_FIRST_MINUTE && currentMinute <= WORKING_HOURS.end * 60

  useEffect(() => {
    const dateChanged = previousDateRef.current !== date
    previousDateRef.current = date
    if (dateChanged) hasScrolledToNowRef.current = false
    if (!showNow || hasScrolledToNowRef.current) return

    const scrollToNow = (): boolean => {
      const timeline = timelineRef.current
      const scrollContainer = scrollContainerRef?.current ?? timeline?.parentElement
      const nowLine = nowLineRef.current
      if (!timeline || !scrollContainer || !nowLine || scrollContainer.clientHeight === 0)
        return false

      scrollContainer.scrollTop = Math.max(
        0,
        timeline.offsetTop + nowLine.offsetTop - scrollContainer.clientHeight / 2
      )
      hasScrolledToNowRef.current = true

      return true
    }
    let observer: ResizeObserver | undefined
    const frame = window.requestAnimationFrame(() => {
      if (scrollToNow()) return

      const timeline = timelineRef.current
      const scrollContainer = scrollContainerRef?.current ?? timeline?.parentElement
      if (!scrollContainer) return
      observer = new ResizeObserver(() => {
        if (scrollToNow()) observer?.disconnect()
      })
      observer.observe(scrollContainer)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [date, scrollContainerRef, showNow])

  return (
    <div
      ref={timelineRef}
      className={cn(
        blocked ? "relative opacity-45" : "relative cursor-default touch-pan-y select-none"
      )}
      style={{ height: TIMELINE_DAY_MINUTES * TIMELINE_PIXELS_PER_MINUTE }}
      onPointerDownCapture={startSelection}
      onPointerMove={moveSelection}
      onPointerUp={finishSelection}
      onPointerCancel={() => {
        dragStart.current = undefined
        dragRange.current = undefined
      }}
      onLostPointerCapture={() => {
        dragStart.current = undefined
        dragRange.current = undefined
      }}
    >
      <BookingTimelineGrid
        blocked={blocked}
        isToday={isToday}
        pastOverlayMinute={pastOverlayMinute}
        unavailableRanges={unavailableRanges}
        startMinute={startMinute}
        endMinute={endMinute}
        outsideWindow={outsideWindow}
        available={available}
        onRange={onRange}
      />
      <div
        data-timeline-scroll-gutter
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-30 w-12 touch-pan-y"
      />
      {bookings.map((booking) => {
        const own = booking.organizerId === DEFAULT_EMPLOYEE_ID
        const selected = booking.id === selectedBookingId
        const pendingRange = pendingRanges[booking.id]
        const bookingStart = pendingRange?.start ?? appClockMinutes(booking.startAt)
        const bookingEnd = pendingRange?.end ?? appClockMinutes(booking.endAt)
        const activeDrag = drag?.bookingId === booking.id ? drag : undefined
        const { displayStart, displayEnd } = displayedRange(bookingStart, bookingEnd, activeDrag)
        const duration = displayEnd - displayStart
        const height = Math.max(1, (displayEnd - displayStart) * TIMELINE_PIXELS_PER_MINUTE)
        const fifteenMinuteLayout = duration <= MIN_BOOKING_DURATION_MINUTES
        const organizer = employees.find((employee) => employee.id === booking.organizerId)
        const canDrag = ALLOW_BOOKING_DRAG_AND_RESIZE && own && new Date(booking.endAt) > now
        const collisionRanges = [
          ...bookings
            .filter((item) => item.id !== booking.id && item.status === "confirmed")
            .map((item) => ({
              start: appClockMinutes(item.startAt),
              end: appClockMinutes(item.endAt),
            })),
          ...(unavailableRanges ?? []),
        ]

        const dragAtPointer = (currentDrag: IDragState, clientY: number): IDragState => {
          const raw =
            Math.round(
              (pointerTimelineY(clientY) - currentDrag.originY) /
                (TIMELINE_PIXELS_PER_MINUTE * BOOKING_SLOT_MINUTES)
            ) * BOOKING_SLOT_MINUTES
          const duration = bookingEnd - bookingStart
          let minimum = TIMELINE_FIRST_MINUTE - bookingStart
          let maximum = dayEnd - bookingEnd
          if (currentDrag.mode === "resize-start") {
            minimum = Math.max(minimum, duration - MAX_BOOKING_DURATION_MINUTES)
            maximum = bookingEnd - bookingStart - MIN_BOOKING_DURATION_MINUTES
          }
          if (currentDrag.mode === "resize-end") {
            minimum = MIN_BOOKING_DURATION_MINUTES - (bookingEnd - bookingStart)
            maximum = Math.min(maximum, MAX_BOOKING_DURATION_MINUTES - duration)
          }
          let deltaMinutes = Math.max(minimum, Math.min(maximum, raw))
          if (currentDrag.mode === "resize-start") {
            const desiredStart = bookingStart + deltaMinutes
            const blockingEnd = Math.max(
              desiredStart,
              ...collisionRanges
                .filter((range) => range.end <= bookingStart && range.end > desiredStart)
                .map((range) => range.end)
            )
            deltaMinutes = blockingEnd - bookingStart
          }
          if (currentDrag.mode === "resize-end") {
            const desiredEnd = bookingEnd + deltaMinutes
            const blockingStart = Math.min(
              desiredEnd,
              ...collisionRanges
                .filter((range) => range.start >= bookingEnd && range.start < desiredEnd)
                .map((range) => range.start)
            )
            deltaMinutes = blockingStart - bookingEnd
          }
          const candidateDrag = { ...currentDrag, deltaMinutes }
          const candidate = displayedRange(bookingStart, bookingEnd, candidateDrag)

          return available(candidate.displayStart, candidate.displayEnd, booking.id)
            ? candidateDrag
            : currentDrag
        }
        const dropDrag = (finalDrag: IDragState): void => {
          const next = displayedRange(bookingStart, bookingEnd, finalDrag)
          if (!finalDrag.deltaMinutes || !available(next.displayStart, next.displayEnd, booking.id))
            return

          setPendingRanges((current) => ({
            ...current,
            [booking.id]: { start: next.displayStart, end: next.displayEnd },
          }))
          const clearPending = () =>
            setPendingRanges((current) => {
              const latest = current[booking.id]
              if (latest?.start !== next.displayStart || latest.end !== next.displayEnd)
                return current
              const updated = { ...current }
              delete updated[booking.id]

              return updated
            })
          void onReschedule(
            booking,
            timelineTimeText(next.displayStart),
            timelineTimeText(next.displayEnd)
          ).then(clearPending, clearPending)
        }
        const openBooking = (): void => {
          if (shouldOpenBooking()) onBooking(booking)
        }

        return (
          <article
            data-booking
            draggable={false}
            key={booking.id}
            className={cn(
              "group/booking absolute left-12 right-1 z-10 touch-none overflow-hidden border border-primary/60 px-2 py-1 shadow-sm outline -outline-offset-1 outline-transparent hover:z-20 hover:outline-2 hover:outline-primary focus-within:z-20 focus-within:outline-2 focus-within:outline-primary",
              bookingParticipationClassName(booking),
              fifteenMinuteLayout && "py-0",
              selected && "z-20 outline-2 outline-primary",
              canDrag && "cursor-grab active:cursor-grabbing",
              activeDrag && "z-30 opacity-80 outline-2 outline-primary"
            )}
            style={{
              top: (displayStart - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE,
              height,
            }}
            onPointerDown={(event) => {
              const button = (event.target as HTMLElement).closest("button")
              if (button && !button.hasAttribute("data-booking-trigger")) return

              startDrag(event, {
                bookingId: booking.id,
                originY: pointerTimelineY(event.clientY),
                enabled: canDrag,
                resolveDrag: dragAtPointer,
                onDrop: dropDrag,
              })
            }}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
            onClick={openBooking}
            onDragStart={(event) => event.preventDefault()}
          >
            <button
              data-booking-trigger
              type="button"
              className="absolute inset-0 z-0"
              aria-label={localize(booking.title, i18n.language)}
            />
            <BookingResizeHandles enabled={canDrag} />
            <div className="pointer-events-none relative z-10 h-full">
              {fifteenMinuteLayout ? (
                <CompactBookingDetails
                  title={localize(booking.title, i18n.language)}
                  organizer={
                    organizer ? localize(organizer.name, i18n.language) : booking.organizerId
                  }
                  start={displayStart}
                  end={displayEnd}
                  className="pr-8"
                />
              ) : (
                <div className="pointer-events-none relative z-10 flex h-full items-start gap-1">
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[11px] font-semibold",
                        fifteenMinuteLayout && "leading-none"
                      )}
                    >
                      {localize(booking.title, i18n.language)}
                    </p>
                    <p
                      className={cn(
                        "truncate text-[9px] opacity-75",
                        fifteenMinuteLayout && "leading-none"
                      )}
                    >
                      <BookingTimeRange
                        start={displayStart}
                        end={displayEnd}
                      />{" "}
                      · {organizer ? localize(organizer.name, i18n.language) : booking.organizerId}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <BookingCardActions
              booking={booking}
              onEdit={() => onEdit(booking)}
              onDelete={() => onDelete(booking)}
            />
          </article>
        )
      })}
      {showNow && (
        <div
          ref={nowLineRef}
          className="pointer-events-none absolute left-10 right-0 z-20 h-0.5 bg-destructive"
          style={{ top: (currentMinute - TIMELINE_FIRST_MINUTE) * TIMELINE_PIXELS_PER_MINUTE }}
        >
          <span className="absolute -left-1 top-1/2 size-2 -translate-y-1/2 bg-destructive" />
        </div>
      )}
      <span className="pointer-events-none absolute bottom-0 left-0 w-11 translate-y-1/2 pr-2 text-right font-mono text-[10px] text-muted-foreground">
        {timelineTimeText(dayEnd)}
      </span>
    </div>
  )
}
