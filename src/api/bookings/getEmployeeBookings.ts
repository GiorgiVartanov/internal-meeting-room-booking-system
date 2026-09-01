import { addDays, endOfMonth, parseISO, startOfMonth } from "date-fns"

import { get } from "@/api/api"
import { dateKey, fromDateAndTime } from "@/lib/date"
import type { IBooking, IBookingFilters, IPaginatedResponse, TEmployeeId } from "@/types"
import { PATHS } from "@/constants"

export type TEmployeeBookingRange = "day" | "week" | "month" | "all"

interface IGetEmployeeBookingsParams {
  employeeId: TEmployeeId
  range: TEmployeeBookingRange
  date?: string
  filters?: IBookingFilters
}

export const getEmployeeBookings = ({
  employeeId,
  range,
  date,
  filters = {},
}: IGetEmployeeBookingsParams) => {
  const reference = date ? parseISO(date) : undefined
  const firstDate =
    reference && range === "month" ? dateKey(startOfMonth(reference)) : (date ?? undefined)
  let lastDate = date
  if (reference && range === "week") lastDate = dateKey(addDays(reference, 6))
  if (reference && range === "month") lastDate = dateKey(endOfMonth(reference))
  const rangeFilters: IBookingFilters =
    range === "all" || !firstDate || !lastDate
      ? {}
      : {
          from: fromDateAndTime(firstDate, "00:00"),
          to: fromDateAndTime(lastDate, "23:59"),
        }

  return get<IPaginatedResponse<IBooking>>(PATHS.api.employeeBookings(employeeId), {
    params: { ...rangeFilters, ...filters, range, date },
  })
}
