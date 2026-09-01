import { useInfiniteQuery } from "@tanstack/react-query"

import { getBookings } from "@/api"
import { BOOKING_PAGE_SIZE } from "@/constants"
import type { IBookingFilters } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const useInfiniteBookings = (filters: IBookingFilters = {}, enabled = true) =>
  useInfiniteQuery({
    queryKey: bookingKeys.infinite(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getBookings({ ...filters, page: pageParam, pageSize: BOOKING_PAGE_SIZE }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
  })
