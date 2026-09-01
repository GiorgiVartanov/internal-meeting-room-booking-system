import { useInfiniteQuery } from "@tanstack/react-query"

import { searchBookings } from "@/api"
import { BOOKING_SEARCH_PAGE_SIZE } from "@/constants"
import type { IBookingFilters } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const useInfiniteBookingSearch = (filters: IBookingFilters, enabled = true) => {
  const query = useInfiniteQuery({
    queryKey: bookingKeys.search(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      searchBookings({ ...filters, page: pageParam, pageSize: BOOKING_SEARCH_PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  })

  return query
}
