import { get } from "@/api/api"
import type { IBooking, IBookingFilters, IPaginatedResponse } from "@/types"
import { PATHS } from "@/constants"

export const searchBookings = (filters: IBookingFilters) =>
  get<IPaginatedResponse<IBooking>>(PATHS.api.bookingSearch, {
    params: {
      ...filters,
      roomIds: filters.roomIds?.join(","),
      organizerIds: filters.organizerIds?.join(","),
      capacity: filters.capacity?.join(","),
      amenities: filters.amenities?.join(","),
    },
  })
