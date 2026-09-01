import { useQueryClient } from "@tanstack/react-query"

import { getBooking } from "@/api"
import type { TBookingId } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const usePrefetchBooking = () => {
  const queryClient = useQueryClient()

  return (bookingId: TBookingId) =>
    queryClient.prefetchQuery({
      queryKey: bookingKeys.detail(bookingId),
      queryFn: () => getBooking(bookingId),
    })
}
