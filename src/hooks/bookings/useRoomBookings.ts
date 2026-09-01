import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { getBookingsForRoom } from "@/api"
import { BOOKING_PAGE_SIZE } from "@/constants"
import type { IBookingFilters } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const useRoomBookings = (filters: IBookingFilters & { roomId: string }, enabled = true) => {
  const { roomId, ...requestFilters } = filters

  const query = useInfiniteQuery({
    queryKey: bookingKeys.room(roomId, requestFilters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getBookingsForRoom({
        roomId,
        ...requestFilters,
        page: pageParam,
        pageSize: BOOKING_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && Boolean(roomId),
  })

  const pageCount = query.data?.pages.length
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
  useEffect(() => {
    if (pageCount === 1 && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, pageCount])

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) }
}
