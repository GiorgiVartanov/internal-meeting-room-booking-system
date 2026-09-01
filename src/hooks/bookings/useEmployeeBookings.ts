import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import { employeeBookingOptions, type IEmployeeBookingHookParams } from "./bookingQueries"

export const useEmployeeBookings = (params: IEmployeeBookingHookParams, enabled = true) => {
  const query = useInfiniteQuery({ ...employeeBookingOptions(params), enabled })

  const pageCount = query.data?.pages.length
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query
  useEffect(() => {
    if (pageCount === 1 && hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, pageCount])

  return { ...query, data: query.data?.pages.flatMap((page) => page.items) }
}
