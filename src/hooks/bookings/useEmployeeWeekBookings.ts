import { useEmployeeBookings } from "./useEmployeeBookings"

import type { IEmployeeBookingHookParams } from "./bookingQueries"

export const useEmployeeWeekBookings = (params: Omit<IEmployeeBookingHookParams, "range">) =>
  useEmployeeBookings({ ...params, range: "week" })
