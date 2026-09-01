import { useQuery } from "@tanstack/react-query"

import { getBookings } from "@/api"
import type { IBookingFilters } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const useBookings = (filters: IBookingFilters = {}, enabled = true) => {
  const request = { ...filters, page: 1, pageSize: 100 }

  return useQuery({
    queryKey: bookingKeys.list(request),
    queryFn: () => getBookings(request),
    select: (response) => response.items,
    enabled,
  })
}
