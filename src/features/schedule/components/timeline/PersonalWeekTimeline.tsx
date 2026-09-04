import { format } from "date-fns"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/api"
import { Button } from "@/components/ui/button"
import { useEditBooking } from "@/hooks"
import { appDateKey, dateKey, dateLocale, fromDateAndTime } from "@/lib/date"
import type { IBooking, IEmployee, IRoom } from "@/types"

import { timelineTimeText } from "../../utils"

import { PersonalWeekDayPanel } from "./PersonalWeekDayPanel"

import type { ReactElement } from "react"

interface IProps {
  days: Date[]
  bookings: IBooking[]
  collisionBookings: IBooking[]
  dragEnabled: boolean
  rooms: IRoom[]
  employees: IEmployee[]
  now: Date
  onBooking: (booking: IBooking) => void
  onEditBooking: (booking: IBooking) => void
  onPrefetchBooking: (bookingId: string) => void
}

/** Displays the current employee's bookings across the selected work week. */
export const PersonalWeekTimeline = ({
  days,
  bookings,
  collisionBookings,
  dragEnabled,
  rooms,
  employees,
  now,
  onBooking,
  onEditBooking,
  onPrefetchBooking,
}: IProps): ReactElement => {
  const { t, i18n } = useTranslation()

  const firstDay = days[0] ?? new Date()

  const [mobileDay, setMobileDay] = useState(() => dateKey(firstDay))
  const edit = useEditBooking()
  const rescheduleQueues = useRef(new Map<string, Promise<void>>())

  const reschedule = (
    booking: IBooking,
    date: string,
    start: number,
    end: number
  ): Promise<void> => {
    const previous = rescheduleQueues.current.get(booking.id) ?? Promise.resolve()
    const request = previous
      .catch(() => undefined)
      .then(() =>
        edit
          .mutateAsync({
            bookingId: booking.id,
            changes: {
              startAt: fromDateAndTime(date, timelineTimeText(start)),
              endAt: fromDateAndTime(date, timelineTimeText(end)),
            },
          })
          .then(() => undefined)
      )
    rescheduleQueues.current.set(booking.id, request)
    void request.finally(() => {
      if (rescheduleQueues.current.get(booking.id) === request)
        rescheduleQueues.current.delete(booking.id)
    })
    toast.promise(request, {
      loading: t("savingChanges"),
      success: t("bookingUpdated"),
      error: (error) => getApiErrorMessage(error, t("bookingFailed")),
    })

    return request
  }

  const bookingsFor = (day: Date): IBooking[] =>
    bookings
      .filter((booking) => appDateKey(booking.startAt) === dateKey(day))
      .sort((first, second) => first.startAt.localeCompare(second.startAt))
  const collisionBookingsFor = (day: Date): IBooking[] =>
    collisionBookings.filter((booking) => appDateKey(booking.startAt) === dateKey(day))

  const selectedDay = days.find((day) => dateKey(day) === mobileDay) ?? firstDay
  const shared = {
    rooms,
    employees,
    now,
    dragEnabled,
    onBooking,
    onEditBooking,
    onPrefetchBooking,
    onReschedule: reschedule,
  }

  return (
    <div
      data-guide="personal-reschedule"
      className="overflow-x-clip border bg-card"
    >
      <div className="sticky -top-2 z-40 grid grid-cols-5 gap-1 border-b bg-card p-2 md:hidden">
        {days.map((day) => (
          <Button
            key={dateKey(day)}
            type="button"
            size="sm"
            variant={dateKey(day) === dateKey(selectedDay) ? "default" : "outline"}
            className="h-11 min-w-0 flex-col px-1 text-[10px]"
            onClick={() => setMobileDay(dateKey(day))}
          >
            <span>{format(day, "EEE", { locale: dateLocale(i18n.language) })}</span>
            <span>{format(day, "d")}</span>
          </Button>
        ))}
      </div>
      <div className="md:hidden">
        <PersonalWeekDayPanel
          day={selectedDay}
          bookings={bookingsFor(selectedDay)}
          collisionBookings={collisionBookingsFor(selectedDay)}
          {...shared}
        />
      </div>
      <div className="hidden grid-cols-5 md:grid">
        {days.map((day) => (
          <PersonalWeekDayPanel
            key={dateKey(day)}
            day={day}
            bookings={bookingsFor(day)}
            collisionBookings={collisionBookingsFor(day)}
            {...shared}
          />
        ))}
      </div>
    </div>
  )
}
