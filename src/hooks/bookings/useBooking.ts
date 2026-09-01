import { useQuery } from "@tanstack/react-query"

import { getBooking } from "@/api"
import type { IBooking, TBookingId } from "@/types"

import { bookingKeys } from "./bookingQueries"

export const useBooking = (bookingId?: TBookingId, initialData?: IBooking) =>
  useQuery({
    queryKey: bookingKeys.detail(bookingId ?? ""),
    queryFn: () => getBooking(bookingId ?? ""),
    enabled: Boolean(bookingId),
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
  })
