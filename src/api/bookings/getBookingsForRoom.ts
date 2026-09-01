import { get } from "@/api/api"
import type { IBooking, IBookingFilters, IPaginatedResponse } from "@/types"
import { PATHS } from "@/constants"

export const getBookings = (filters: IBookingFilters = {}) =>
  get<IPaginatedResponse<IBooking>>(PATHS.api.bookings, {
    params: {
      ...filters,
      roomIds: filters.roomIds?.join(","),
      capacity: filters.capacity?.join(","),
      amenities: filters.amenities?.join(","),
    },
  })

export const getBookingsForRoom = ({ roomId, ...filters }: IBookingFilters & { roomId: string }) =>
  get<IPaginatedResponse<IBooking>>(PATHS.api.roomBookings(roomId), { params: filters })
