import { createContext } from "react"

import type { IBookingDayActivity, IHoliday } from "@/types"

interface IBookingCalendarContextValue {
  availability: Record<string, IBookingDayActivity["availability"]>
  holidaysByDate: Record<string, IHoliday>
}

export const BookingCalendarContext = createContext<IBookingCalendarContextValue | undefined>(
  undefined
)
