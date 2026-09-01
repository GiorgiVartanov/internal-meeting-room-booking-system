import type { IBooking, IBookingFilters } from "@/types"

import type { QueryClient } from "@tanstack/react-query"

export const invalidateBookings = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["bookings"] }),
    queryClient.invalidateQueries({ queryKey: ["booking-activity"] }),
  ])

export const matchesBookingFilters = (booking: IBooking, filters?: IBookingFilters) => {
  if (!filters) return true
  if (filters.roomId && booking.roomId !== filters.roomId) return false
  if (filters.roomIds?.length && !filters.roomIds.includes(booking.roomId)) return false
  if (filters.organizerId && booking.organizerId !== filters.organizerId) return false
  if (
    filters.participantId &&
    booking.organizerId !== filters.participantId &&
    !booking.attendeeIds.includes(filters.participantId)
  )
    return false
  if (filters.status && booking.status !== filters.status) return false
  if (filters.from && booking.endAt < filters.from) return false
  if (filters.to && booking.startAt > filters.to) return false
  if (
    filters.search &&
    !String(booking.title).toLocaleLowerCase().includes(filters.search.toLocaleLowerCase())
  )
    return false

  return !filters.capacity?.length && !filters.amenities?.length
}
