import { UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import { BOOKING_SLOT_MINUTES, WORKING_HOURS } from "@/constants"
import { BookingCardActions, BookingTimeRange } from "@/features/schedule"
import {
  bookingParticipationClassName,
  TIMELINE_DAY_MINUTES,
  TIMELINE_FIRST_MINUTE,
  TIMELINE_SLOTS,
  timelineTimeText,
} from "@/features/schedule/utils"
import { useTimelineNow } from "@/hooks"
import { appClockMinutes, appDateKey, dateKey } from "@/lib/date"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBooking, IEmployee, IRoom } from "@/types"

import type { ReactElement } from "react"

const DASHBOARD_PIXELS_PER_MINUTE = 1.35
const CARD_WIDTH = 200
const CARD_GAP = 4

interface IProps {
  date?: Date
  rooms: IRoom[]
  bookings: IBooking[]
  employees: IEmployee[]
  onBooking: (booking: IBooking) => void
  onEditBooking: (booking: IBooking) => void
}

interface IPositionedBooking {
  booking: IBooking
  lane: number
  start: number
  end: number
}

/** Assigns non-overlapping horizontal lanes to dashboard booking cards. */
const positionBookings = (bookings: IBooking[]): IPositionedBooking[] => {
  const laneEnds: number[] = []

  return [...bookings]
    .sort((first, second) => first.startAt.localeCompare(second.startAt))
    .map<IPositionedBooking>((booking) => {
      const start = appClockMinutes(booking.startAt)
      const end = appClockMinutes(booking.endAt)
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)
      if (lane < 0) lane = laneEnds.length
      laneEnds[lane] = end

      return { booking, lane, start, end }
    })
}

/** Displays a day's bookings as duration-sized cards on the dashboard timeline. */
export const DashboardBookingsTimeline = ({
  date,
  rooms,
  bookings,
  employees,
  onBooking,
  onEditBooking,
}: IProps): ReactElement => {
  const { t, i18n } = useTranslation()
  const now = useTimelineNow()

  const positioned = positionBookings(bookings)
  const laneCount = Math.max(1, ...positioned.map((item) => item.lane + 1))
  const contentWidth = 52 + laneCount * (CARD_WIDTH + CARD_GAP)
  const dayEnd = TIMELINE_FIRST_MINUTE + TIMELINE_DAY_MINUTES
  const currentMinute = appClockMinutes(now)
  const today = Boolean(date && dateKey(date) === appDateKey(now))
  const pastOverlayMinute = Math.max(TIMELINE_FIRST_MINUTE, Math.min(dayEnd, currentMinute))
  const showNow =
    today && currentMinute >= TIMELINE_FIRST_MINUTE && currentMinute <= WORKING_HOURS.end * 60

  return (
    <div
      className="relative w-full"
      style={{ height: TIMELINE_DAY_MINUTES * DASHBOARD_PIXELS_PER_MINUTE, minWidth: contentWidth }}
    >
      {TIMELINE_SLOTS.map((minute) => (
        <div
          key={minute}
          className="absolute left-12 right-0 border-t"
          style={{
            top: (minute - TIMELINE_FIRST_MINUTE) * DASHBOARD_PIXELS_PER_MINUTE,
            height: BOOKING_SLOT_MINUTES * DASHBOARD_PIXELS_PER_MINUTE,
          }}
        >
          {minute % 60 === 0 && (
            <span className="absolute right-full -top-2 w-11 pr-2 text-right font-mono text-[10px] text-muted-foreground">
              {timelineTimeText(minute)}
            </span>
          )}
        </div>
      ))}
      {today && pastOverlayMinute > TIMELINE_FIRST_MINUTE && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[15] bg-background/45"
          style={{
            top: -8,
            height: (pastOverlayMinute - TIMELINE_FIRST_MINUTE) * DASHBOARD_PIXELS_PER_MINUTE + 8,
          }}
        />
      )}
      {positioned.map(({ booking, lane, start, end }) => {
        const room = rooms.find((item) => item.id === booking.roomId)
        const organizer = employees.find((employee) => employee.id === booking.organizerId)
        const duration = end - start
        const fifteenMinuteLayout = duration <= BOOKING_SLOT_MINUTES
        const compactLayout = duration <= 2 * BOOKING_SLOT_MINUTES

        return (
          <article
            data-booking
            key={booking.id}
            className={cn(
              "absolute z-10 max-w-[200px] overflow-hidden border border-primary/60 px-2 py-1 text-left shadow-sm outline outline-1 -outline-offset-1 outline-transparent transition-[background-color,outline-color] hover:outline-2 hover:outline-primary focus-within:outline-2 focus-within:outline-primary",
              bookingParticipationClassName(booking),
              fifteenMinuteLayout && "py-0"
            )}
            style={{
              left: 52 + lane * (CARD_WIDTH + CARD_GAP),
              top: (start - TIMELINE_FIRST_MINUTE) * DASHBOARD_PIXELS_PER_MINUTE,
              width: CARD_WIDTH,
              height: Math.max(1, duration * DASHBOARD_PIXELS_PER_MINUTE),
            }}
          >
            <button
              type="button"
              className="absolute inset-0 z-0"
              aria-label={localize(booking.title, i18n.language)}
              onClick={() => onBooking(booking)}
            />
            <div
              className={cn(
                "pointer-events-none relative z-10",
                fifteenMinuteLayout && "flex h-full items-center gap-1 pr-8"
              )}
            >
              <p
                className={cn(
                  "truncate pr-12 text-[11px] font-semibold",
                  fifteenMinuteLayout && "min-w-0 flex-1 pr-0 leading-none"
                )}
              >
                {localize(booking.title, i18n.language)}
              </p>
              {fifteenMinuteLayout ? (
                <BookingTimeRange
                  start={start}
                  end={end}
                  className="shrink-0 text-[8px] leading-none opacity-75"
                />
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
                      {organizer ? localize(organizer.name, i18n.language) : booking.organizerId}
                    </span>
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
      {!positioned.length && (
        <p className="absolute left-14 right-4 top-6 border border-dashed bg-card/80 p-4 text-center text-base font-medium text-muted-foreground">
          {t("noBookings")}
        </p>
      )}
      {showNow && (
        <div
          className="pointer-events-none absolute left-10 right-0 z-20 border-t-2 border-destructive"
          style={{ top: (currentMinute - TIMELINE_FIRST_MINUTE) * DASHBOARD_PIXELS_PER_MINUTE }}
        >
          <span className="absolute -left-1 -top-1 size-2 bg-destructive" />
        </div>
      )}
      <span className="pointer-events-none absolute bottom-0 left-0 w-11 translate-y-1/2 pr-2 text-right font-mono text-[10px] text-muted-foreground">
        {timelineTimeText(dayEnd)}
      </span>
    </div>
  )
}
