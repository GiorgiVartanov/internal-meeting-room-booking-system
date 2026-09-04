import { addDays } from "date-fns"

import { getEmployeeBookings, type TEmployeeBookingRange } from "@/api"
import { BOOKING_PAGE_SIZE } from "@/constants"
import { dateKey, fromDateAndTime } from "@/lib/date"
import type {
  IBooking,
  IBookingFilters,
  IPaginatedResponse,
  TBookingId,
  TEmployeeId,
} from "@/types"

import type { QueryClient } from "@tanstack/react-query"

export interface IEmployeeBookingHookParams {
  employeeId: TEmployeeId
  range: TEmployeeBookingRange
  date?: string
  filters?: IBookingFilters
}

export const bookingKeys = {
  all: ["bookings"] as const,
  list: (filters: IBookingFilters) => ["bookings", "list", filters] as const,
  infinite: (filters: IBookingFilters) => ["bookings", "infinite", filters] as const,
  detail: (bookingId: TBookingId) => ["bookings", "detail", bookingId] as const,
  search: (filters: IBookingFilters) => ["bookings", "search", filters] as const,
  room: (roomId: string, filters: IBookingFilters) =>
    ["bookings", "room", roomId, filters] as const,
  employee: (
    employeeId: TEmployeeId,
    range: TEmployeeBookingRange,
    date: string | undefined,
    filters: IBookingFilters
  ) => ["bookings", "employee", employeeId, range, date, filters] as const,
}

export const employeeWeekBookingParams = (employeeId: TEmployeeId, start: Date) => ({
  employeeId,
  range: "week" as const,
  date: dateKey(start),
  filters: {
    status: "confirmed" as const,
    from: fromDateAndTime(dateKey(start), "00:00"),
    to: fromDateAndTime(dateKey(addDays(start, 4)), "23:59"),
  },
})

export const employeeBookingOptions = ({
  employeeId,
  range,
  date,
  filters = {},
}: IEmployeeBookingHookParams) => ({
  queryKey: bookingKeys.employee(employeeId, range, date, filters),
  initialPageParam: 1,
  queryFn: ({ pageParam }: { pageParam: number }) =>
    getEmployeeBookings({
      employeeId,
      range,
      date,
      filters: { ...filters, page: pageParam, pageSize: BOOKING_PAGE_SIZE },
    }),
  getNextPageParam: (lastPage: IPaginatedResponse<IBooking>) =>
    lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
})

export const prefetchEmployeeBookingPages = (
  queryClient: QueryClient,
  params: IEmployeeBookingHookParams
) =>
  queryClient
    .infiniteQuery({ ...employeeBookingOptions(params), pages: 2 })
    .catch(() => undefined)
