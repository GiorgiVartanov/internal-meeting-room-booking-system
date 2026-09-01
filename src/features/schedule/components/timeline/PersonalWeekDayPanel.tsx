import { format } from "date-fns"
import { UserRound } from "lucide-react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  ALLOW_BOOKING_DRAG_AND_RESIZE,
  BOOKING_SLOT_MINUTES,
  DEFAULT_EMPLOYEE_ID,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  WORKING_HOURS,
} from "@/constants"
import { appClockMinutes, appDateKey, dateKey, dateLocale } from "@/lib/date"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBooking, IEmployee, IRoom } from "@/types"

import { useTimelineBookingDrag } from "../../hooks"
import {
  type IDragState,
  type IPositionedBooking,
  bookingParticipationClassName,
  mergePersonalWeekRanges as mergeRanges,
  overlapRanges,
  positionBookings,
  TIMELINE_DAY_MINUTES,
  TIMELINE_FIRST_MINUTE,
  TIMELINE_SLOTS,
  timelineTimeText,
  WEEK_TIMELINE_PIXELS_PER_MINUTE,
} from "../../utils"
import { BookingCardActions } from "../booking"

import { BookingResizeHandles } from "./BookingResizeHandles"
import { BookingTimeRange } from "./BookingTimeRange"

import type { ReactElement } from "react"

interface IProps {
  day: Date
  bookings: IBooking[]
  collisionBookings: IBooking[]
  dragEnabled: boolean
  rooms: IRoom[]
  employees: IEmployee[]
  now: Date
  onBooking: (booking: IBooking) => void
  onEditBooking: (booking: IBooking) => void
  onPrefetchBooking: (bookingId: string) => void
  onReschedule: (booking: IBooking, date: string, start: number, end: number) => Promise<void>
}

/** Displays one day of an employee's bookings within the personal weekly schedule. */
export const PersonalWeekDayPanel = ({
  day,
  bookings,
  collisionBookings,
  rooms,
  employees,
  now,
  dragEnabled,
  onBooking,
  onEditBooking,
  onPrefetchBooking,
  onReschedule,
}: IProps): ReactElement => {
  const { t, i18n } = useTranslation()
  const { drag, startDrag, moveDrag, finishDrag, cancelDrag, shouldOpenBooking } =
    useTimelineBookingDrag()
  const [pending, setPending] = useState<Record<string, { start: number; end: number }>>({})
  const timelineRef = useRef<HTMLDivElement>(null)

  const key = dateKey(day)
  const today = key === appDateKey(now)
  const past = key < appDateKey(now)
  const currentMinute = appClockMinutes(now)
  const dayEnd = TIMELINE_FIRST_MINUTE + TIMELINE_DAY_MINUTES
  const pastOverlayMinute = Math.max(TIMELINE_FIRST_MINUTE, Math.min(dayEnd, currentMinute))
  const showNow =
    today && currentMinute >= TIMELINE_FIRST_MINUTE && currentMinute <= WORKING_HOURS.end * 60
  const positioned = positionBookings(bookings, i18n.language)

  const displayedRange = (item: IPositionedBooking, activeDrag?: IDragState) => {
    const saved = pending[item.booking.id]
    const start = saved?.start ?? item.start
    const end = saved?.end ?? item.end
    if (!activeDrag) return { start, end }
    if (activeDrag.mode === "resize-start") return { start: start + activeDrag.deltaMinutes, end }
    if (activeDrag.mode === "resize-end") return { start, end: end + activeDrag.deltaMinutes }

    return { start: start + activeDrag.deltaMinutes, end: end + activeDrag.deltaMinutes }
  }
  const roomIsAvailable = (booking: IBooking, start: number, end: number): boolean =>
    !collisionBookings.some(
      (other) =>
        other.id !== booking.id &&
        other.status === "confirmed" &&
        other.roomId === booking.roomId &&
        start < appClockMinutes(other.endAt) &&
        end > appClockMinutes(other.startAt)
    )
  const draggedBooking = drag
    ? bookings.find((booking) => booking.id === drag.bookingId)
    : undefined
  const roomBlockers = draggedBooking
    ? collisionBookings.filter(
        (booking) =>
          booking.id !== draggedBooking.id &&
          booking.status === "confirmed" &&
          booking.roomId === draggedBooking.roomId
      )
    : []
  const roomBlockerRanges = mergeRanges(
    roomBlockers.map((booking) => ({
      start: appClockMinutes(booking.startAt),
      end: appClockMinutes(booking.endAt),
    }))
  )
  const draggedItem = drag
    ? positioned.find((item) => item.booking.id === drag.bookingId)
    : undefined
  const draggedRange = draggedItem ? displayedRange(draggedItem, drag) : undefined

  const pointerTimelineY = (clientY: number): number =>
    clientY - (timelineRef.current?.getBoundingClientRect().top ?? 0)

  return (
    <section className="min-w-0 border-r last:border-r-0">
      <header
        data-guide="personal-timeline-overview"
        className={cn(
          "sticky -top-2 z-30 border-b bg-card p-3 text-center",
          today && "bg-primary text-primary-foreground"
        )}
      >
        <h2 className="text-sm font-semibold capitalize">
          {format(day, "EEEE", { locale: dateLocale(i18n.language) })}
        </h2>
        <p
          className={cn("text-xs", today ? "text-primary-foreground/80" : "text-muted-foreground")}
        >
          {format(day, "MMM d", { locale: dateLocale(i18n.language) })}
        </p>
      </header>
      <div className="py-3">
        <div
          ref={timelineRef}
          className="relative"
          style={{ height: TIMELINE_DAY_MINUTES * WEEK_TIMELINE_PIXELS_PER_MINUTE }}
        >
          {TIMELINE_SLOTS.map((minute) => (
            <div
              key={minute}
              className="absolute left-10 right-0 border-t"
              style={{
                top: (minute - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
                height: BOOKING_SLOT_MINUTES * WEEK_TIMELINE_PIXELS_PER_MINUTE,
              }}
            >
              {minute % 60 === 0 && (
                <span className="absolute right-full -top-2 w-10 pr-1 text-right font-mono text-[9px] text-muted-foreground">
                  {timelineTimeText(minute)}
                </span>
              )}
            </div>
          ))}
          {(past || (today && pastOverlayMinute > TIMELINE_FIRST_MINUTE)) && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-15 bg-background/45"
              style={{
                top: -8,
                height: past
                  ? TIMELINE_DAY_MINUTES * WEEK_TIMELINE_PIXELS_PER_MINUTE + 8
                  : (pastOverlayMinute - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE +
                    8,
              }}
            />
          )}
          {roomBlockerRanges.map((range) => (
            <div
              key={`room-blocker-${range.start}-${range.end}`}
              aria-hidden
              className="pointer-events-none absolute left-10 right-1 z-5 border border-destructive/60 bg-destructive/15"
              style={{
                top: (range.start - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
                height: Math.max(1, (range.end - range.start) * WEEK_TIMELINE_PIXELS_PER_MINUTE),
              }}
            />
          ))}
          {positioned.map((item) => {
            const { booking, lane, laneCount } = item
            const activeDrag = drag?.bookingId === booking.id ? drag : undefined
            const { start, end } = displayedRange(item, activeDrag)
            const duration = end - start
            const fifteenMinuteLayout = duration <= MIN_BOOKING_DURATION_MINUTES
            const compactLayout = duration <= 2 * MIN_BOOKING_DURATION_MINUTES
            const room = rooms.find((item) => item.id === booking.roomId)
            const organizer = employees.find((item) => item.id === booking.organizerId)
            const invited =
              booking.organizerId !== DEFAULT_EMPLOYEE_ID &&
              booking.attendeeIds.includes(DEFAULT_EMPLOYEE_ID)
            const canDrag =
              ALLOW_BOOKING_DRAG_AND_RESIZE &&
              dragEnabled &&
              booking.organizerId === DEFAULT_EMPLOYEE_ID &&
              new Date(booking.endAt) > now
            const dragAtPointer = (currentDrag: IDragState, clientY: number): IDragState => {
              const raw =
                Math.round(
                  (pointerTimelineY(clientY) - currentDrag.originY) /
                    (WEEK_TIMELINE_PIXELS_PER_MINUTE * BOOKING_SLOT_MINUTES)
                ) * BOOKING_SLOT_MINUTES
              const duration = item.end - item.start
              let minimum = TIMELINE_FIRST_MINUTE - item.start
              let maximum = dayEnd - item.end
              if (currentDrag.mode === "resize-start") {
                minimum = Math.max(minimum, duration - MAX_BOOKING_DURATION_MINUTES)
                maximum = duration - MIN_BOOKING_DURATION_MINUTES
              }
              if (currentDrag.mode === "resize-end") {
                minimum = MIN_BOOKING_DURATION_MINUTES - duration
                maximum = Math.min(maximum, MAX_BOOKING_DURATION_MINUTES - duration)
              }
              let deltaMinutes = Math.max(minimum, Math.min(maximum, raw))
              const collisionRanges = collisionBookings
                .filter(
                  (other) =>
                    other.id !== booking.id &&
                    other.status === "confirmed" &&
                    other.roomId === booking.roomId
                )
                .map((other) => ({
                  start: appClockMinutes(other.startAt),
                  end: appClockMinutes(other.endAt),
                }))
              if (currentDrag.mode === "resize-start") {
                const desiredStart = item.start + deltaMinutes
                const blockingEnd = Math.max(
                  desiredStart,
                  ...collisionRanges
                    .filter((range) => range.end <= item.start && range.end > desiredStart)
                    .map((range) => range.end)
                )
                deltaMinutes = blockingEnd - item.start
              }
              if (currentDrag.mode === "resize-end") {
                const desiredEnd = item.end + deltaMinutes
                const blockingStart = Math.min(
                  desiredEnd,
                  ...collisionRanges
                    .filter((range) => range.start >= item.end && range.start < desiredEnd)
                    .map((range) => range.start)
                )
                deltaMinutes = blockingStart - item.end
              }
              const candidateDrag = { ...currentDrag, deltaMinutes }
              const candidate = displayedRange(item, candidateDrag)

              return roomIsAvailable(booking, candidate.start, candidate.end)
                ? candidateDrag
                : currentDrag
            }
            const dropDrag = (finalDrag: IDragState): void => {
              const next = displayedRange(item, finalDrag)
              if (!finalDrag.deltaMinutes || !roomIsAvailable(booking, next.start, next.end)) return

              setPending((current) => ({ ...current, [booking.id]: next }))
              void onReschedule(booking, key, next.start, next.end).finally(() =>
                setPending((current) => {
                  const latest = current[booking.id]
                  if (latest?.start !== next.start || latest.end !== next.end) return current
                  const updated = { ...current }
                  delete updated[booking.id]

                  return updated
                })
              )
            }

            return (
              <article
                data-booking
                draggable={false}
                data-guide={canDrag ? "personal-reschedule" : undefined}
                key={booking.id}
                className={cn(
                  "group/booking absolute z-10 overflow-hidden border border-primary/60 px-2 py-1 text-left shadow-sm outline-none transition-[transform,box-shadow,opacity,background-color] hover:z-20 hover:ring-2 hover:ring-primary focus-within:z-20 focus-within:ring-2 focus-within:ring-primary",
                  bookingParticipationClassName(booking),
                  fifteenMinuteLayout && "py-0",
                  canDrag && "cursor-grab touch-none active:cursor-grabbing",
                  activeDrag && "z-40 opacity-80 shadow-lg"
                )}
                style={{
                  left: `calc(2.5rem + (100% - 2.75rem) * ${lane / laneCount} + 2px)`,
                  width: `calc((100% - 2.75rem) / ${laneCount} - 4px)`,
                  top: (start - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
                  height: Math.max(1, duration * WEEK_TIMELINE_PIXELS_PER_MINUTE),
                }}
                onPointerDown={(event) => {
                  const button = (event.target as HTMLElement).closest("button, a")
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
                onClick={() => {
                  if (shouldOpenBooking()) onBooking(booking)
                }}
                onDragStart={(event) => event.preventDefault()}
                onPointerEnter={() => {
                  onPrefetchBooking(booking.id)
                  if (room?.imageUrl) new Image().src = room.imageUrl
                }}
              >
                <button
                  data-booking-trigger
                  type="button"
                  className="absolute inset-0 z-0"
                  aria-label={localize(booking.title, i18n.language)}
                  onFocus={() => onPrefetchBooking(booking.id)}
                />
                <BookingResizeHandles enabled={canDrag} />
                <div
                  className={cn(
                    "pointer-events-none relative z-10",
                    fifteenMinuteLayout && "flex h-full items-center gap-1 pr-8"
                  )}
                >
                  {invited && !fifteenMinuteLayout && (
                    <span className="absolute right-1 top-1 bg-secondary/90 px-1 text-[8px] font-semibold uppercase tracking-wide text-primary">
                      {t("invited")}
                    </span>
                  )}
                  <strong
                    className={cn(
                      "block truncate pr-12 text-[11px]",
                      fifteenMinuteLayout && "min-w-0 flex-[2] pr-0 leading-none"
                    )}
                  >
                    {localize(booking.title, i18n.language)}
                  </strong>
                  {fifteenMinuteLayout ? (
                    <>
                      <BookingTimeRange
                        start={start}
                        end={end}
                        className="shrink-0 text-[8px] leading-none opacity-75"
                      />
                      <span className="min-w-0 flex-1 truncate text-[8px] leading-none opacity-75">
                        <UserRound className="mr-0.5 inline size-2 shrink-0" />
                        {organizer ? localize(organizer.name, i18n.language) : booking.organizerId}
                      </span>
                      <span className="inline-flex min-w-0 max-w-[35%] truncate border border-primary/30 bg-primary/10 px-1 text-[8px] font-medium leading-none text-primary">
                        {room ? localize(room.name, i18n.language) : booking.roomId}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex min-w-0 items-center gap-1 truncate text-[9px] opacity-75">
                        <BookingTimeRange
                          start={start}
                          end={end}
                          className="shrink-0"
                        />
                        <span aria-hidden>·</span>
                        <span className="flex min-w-0 items-center gap-1 truncate">
                          <UserRound className="size-2.5 shrink-0" />
                          {organizer
                            ? localize(organizer.name, i18n.language)
                            : booking.organizerId}
                        </span>
                        {compactLayout && (
                          <span className="inline-flex min-w-0 max-w-[40%] truncate border border-primary/30 bg-primary/10 px-1 font-medium text-primary">
                            {room ? localize(room.name, i18n.language) : booking.roomId}
                          </span>
                        )}
                      </span>
                      {!compactLayout && (
                        <span className="mt-0.5 inline-flex w-fit max-w-full truncate border border-primary/30 bg-primary/10 px-1 text-[9px] font-medium text-primary">
                          {room ? localize(room.name, i18n.language) : booking.roomId}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <BookingCardActions
                  booking={booking}
                  compact={fifteenMinuteLayout}
                  onEdit={() => onEditBooking(booking)}
                />
              </article>
            )
          })}
          {draggedItem && draggedRange && roomBlockerRanges.length > 0 && (
            <p
              role="status"
              className="pointer-events-none absolute z-50 text-[9px] leading-tight text-destructive"
              style={{
                left: `calc(2.5rem + (100% - 2.75rem) * ${draggedItem.lane / draggedItem.laneCount} + 2px)`,
                width: `calc((100% - 2.75rem) / ${draggedItem.laneCount} - 4px)`,
                top:
                  (draggedRange.end - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE + 2,
              }}
            >
              {t("redTimesBookedInRoom")}
            </p>
          )}
          {overlapRanges(bookings).map((range) => (
            <div
              key={`${range.start}-${range.end}`}
              className="pointer-events-none absolute left-10 right-1 z-20 border-y border-red-500/40 bg-red-500/15"
              style={{
                top: (range.start - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
                height: (range.end - range.start) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
              }}
              role="img"
              aria-label={t("meetingConflict")}
            />
          ))}
          {showNow && (
            <div
              className="pointer-events-none absolute left-9 right-0 z-30 border-t-2 border-destructive"
              style={{
                top: (currentMinute - TIMELINE_FIRST_MINUTE) * WEEK_TIMELINE_PIXELS_PER_MINUTE,
              }}
            >
              <span className="absolute -left-1 -top-1 size-2 bg-destructive" />
            </div>
          )}
          {!bookings.length && (
            <p className="absolute left-11 right-2 top-6 border border-dashed bg-card/80 p-3 text-center text-sm font-medium text-muted-foreground xl:text-base">
              {t("noBookings")}
            </p>
          )}
          <span className="pointer-events-none absolute bottom-0 left-0 w-10 translate-y-1/2 pr-1 text-right font-mono text-[9px] text-muted-foreground">
            {timelineTimeText(dayEnd)}
          </span>
        </div>
      </div>
    </section>
  )
}
