import { useEmployeeBookings } from "./useEmployeeBookings"

import type { IEmployeeBookingHookParams } from "./bookingQueries"

export const useEmployeeDayBookings = (params: Omit<IEmployeeBookingHookParams, "range">) =>
  useEmployeeBookings({ ...params, range: "day" })
