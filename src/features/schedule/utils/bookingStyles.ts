import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import type { IBooking } from "@/types"

/** Selects booking-card colors based on the current employee's participation. */
export const bookingParticipationClassName = (booking: IBooking): string => {
  if (booking.organizerId === DEFAULT_EMPLOYEE_ID)
    return "bg-[var(--booking-own)] text-foreground ring-1 ring-inset ring-primary/25 hover:bg-[var(--booking-own-hover)]"
  if (booking.attendeeIds.includes(DEFAULT_EMPLOYEE_ID))
    return "bg-[var(--booking-invited)] text-foreground hover:bg-[var(--booking-invited-hover)]"

  return "bg-[var(--booking-other)] text-foreground hover:bg-[var(--booking-other-hover)]"
}
