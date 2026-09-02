import {
  addMonths,
  isBefore,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns"

import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  CALENDAR_FUTURE_MONTHS,
  CALENDAR_PAST_MONTHS,
} from "@/constants"
import { appDateKey } from "@/lib/date"
import type { IBooking, IBookingDayActivity, IHoliday } from "@/types"

import type { Matcher } from "react-day-picker"

interface IGetBookingCalendarStateArgs {
  activity?: IBookingDayActivity[]
  bookings: IBooking[]
  currentMonth: Date
  disablePast: boolean
  holidays: IHoliday[]
  selected?: Date
  showBlockedSelection: boolean
  today: Date
}

export interface IBookingCalendarState {
  availability: Record<string, IBookingDayActivity["availability"]>
  disabled: Matcher[]
  earliest: Date
  holidayDates: Date[]
  holidayDateKeys: Set<string>
  holidaysByDate: Record<string, IHoliday>
  latest: Date
  selectedIsBlocked: boolean
}

/** Calculates calendar availability, date bounds, and booking restrictions. */
export const getBookingCalendarState = ({
  activity,
  bookings,
  currentMonth,
  disablePast,
  holidays,
  selected,
  showBlockedSelection,
  today,
}: IGetBookingCalendarStateArgs): IBookingCalendarState => {
  const availability = activity
    ? Object.fromEntries(activity.map((item) => [item.date, item.availability]))
    : Object.fromEntries(
        [...new Set(bookings.map((booking) => appDateKey(booking.startAt)))].map((date) => [
          date,
          "low" as const,
        ])
      )
  const bookingEarliest = bookings.length
    ? new Date(Math.min(...bookings.map((booking) => new Date(booking.startAt).getTime())))
    : currentMonth
  const activityEarliest = activity?.length
    ? activity.map((item) => item.date).sort((left, right) => left.localeCompare(right))[0]
    : undefined
  const earliestDate = activityEarliest ? new Date(`${activityEarliest}T12:00:00`) : bookingEarliest
  const dataEarliest = startOfMonth(earliestDate)
  const policyEarliest = startOfMonth(subMonths(currentMonth, CALENDAR_PAST_MONTHS))
  const earliest = dataEarliest < policyEarliest ? dataEarliest : policyEarliest
  const latest = startOfMonth(addMonths(currentMonth, CALENDAR_FUTURE_MONTHS))
  const holidayDates = holidays.map((holiday) => new Date(`${holiday.date}T12:00:00`))
  const holidayDateKeys = new Set(holidays.map((holiday) => holiday.date))
  const holidaysByDate = Object.fromEntries(holidays.map((holiday) => [holiday.date, holiday]))
  const disabled: Matcher[] = [
    ...(!ALLOW_WEEKEND_BOOKINGS ? [{ dayOfWeek: [0, 6] }] : []),
    ...(!ALLOW_HOLIDAY_BOOKINGS ? holidayDates : []),
    ...(disablePast ? [{ before: startOfDay(today) }] : []),
  ]
  const selectedIsBlocked = Boolean(
    !showBlockedSelection &&
    selected &&
    ((!ALLOW_WEEKEND_BOOKINGS && isWeekend(selected)) ||
      (!ALLOW_HOLIDAY_BOOKINGS && holidayDates.some((date) => isSameDay(date, selected))) ||
      (disablePast && isBefore(selected, startOfDay(today))))
  )

  return {
    availability,
    disabled,
    earliest,
    holidayDates,
    holidayDateKeys,
    holidaysByDate,
    latest,
    selectedIsBlocked,
  }
}
