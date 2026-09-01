import { useEffect } from "react"

import type { IBookingFilters } from "@/types"

import { useInfiniteBookings } from "./useInfiniteBookings"

export const usePagedBookings = (filters: IBookingFilters = {}, enabled = true) => {
  const query = useInfiniteBookings(filters, enabled)

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) }
}
