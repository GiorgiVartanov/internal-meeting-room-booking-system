import { get } from "@/api/api"
import type { IBookingDayActivity, IEmployee, IHoliday } from "@/types"
import { PATHS } from "@/constants"

export const getHolidays = () => get<IHoliday[]>(PATHS.api.holidays)

export const getEmployees = () => get<IEmployee[]>(PATHS.api.employees)

export const getBookingActivity = ({
  organizerId,
  participantId,
}: { organizerId?: string; participantId?: string } = {}) =>
  get<IBookingDayActivity[]>(PATHS.api.bookingActivity, { params: { organizerId, participantId } })
