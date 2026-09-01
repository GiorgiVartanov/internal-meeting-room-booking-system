import { useMutation, useQueryClient } from "@tanstack/react-query"

import { editBooking } from "@/api"
import type { IBooking, IBookingFilters, IPaginatedResponse } from "@/types"

import { bookingKeys } from "./bookingQueries"
import { invalidateBookings, matchesBookingFilters } from "./bookingMutationUtils"

export const useEditBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editBooking,
    onMutate: async ({ bookingId, changes }) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all })
      const snapshots = queryClient.getQueriesData<IPaginatedResponse<IBooking>>({
        queryKey: bookingKeys.all,
      })
      const previous = snapshots
        .flatMap(([, data]) => data?.items ?? [])
        .find((booking) => booking.id === bookingId)
      if (!previous) return { snapshots }
      const optimistic: IBooking = { ...previous, ...changes, updatedAt: new Date().toISOString() }
      snapshots.forEach(([queryKey, current]) => {
        if (!current || queryKey[1] !== "list") return
        const filters = queryKey[2] as IBookingFilters | undefined
        const withoutPrevious = current.items.filter((booking) => booking.id !== bookingId)
        const includesOptimistic = matchesBookingFilters(optimistic, filters)
        queryClient.setQueryData(queryKey, {
          ...current,
          items: includesOptimistic ? [optimistic, ...withoutPrevious] : withoutPrevious,
          total:
            current.total +
            Number(includesOptimistic) -
            Number(current.items.some((booking) => booking.id === bookingId)),
        })
      })

      return { snapshots }
    },
    onError: (_error, _input, context) =>
      context?.snapshots.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data)),
    onSuccess: (updated) =>
      queryClient.setQueriesData<IPaginatedResponse<IBooking>>(
        { queryKey: ["bookings", "list"] },
        (current) =>
          current
            ? {
                ...current,
                items: current.items.map((booking) =>
                  booking.id === updated.id ? updated : booking
                ),
              }
            : current
      ),
    onSettled: () => invalidateBookings(queryClient),
  })
}
