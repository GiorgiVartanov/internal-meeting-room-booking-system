import { useContext } from "react"

import { BookingCalendarContext } from "../context"

/** Reads the nearest booking calendar state and guards against a missing provider. */
export const useBookingCalendarContext = () => {
  const context = useContext(BookingCalendarContext)

  if (!context) throw new Error("BookingCalendarDayButton must be inside BookingCalendar.")

  return context
}
