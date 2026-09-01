import { useMutation, useQueryClient } from "@tanstack/react-query"

import { bookRoom } from "@/api"
import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import type { IBooking, IBookingFilters, IPaginatedResponse } from "@/types"

import { bookingKeys } from "./bookingQueries"
import { invalidateBookings, matchesBookingFilters } from "./bookingMutationUtils"

export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bookRoom,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all })
      const snapshots = queryClient.getQueriesData<IPaginatedResponse<IBooking>>({
        queryKey: bookingKeys.all,
      })
      const optimisticId = `optimistic-${crypto.randomUUID()}`
      const now = new Date().toISOString()
      const optimistic: IBooking = {
        ...input,
        organizerId: DEFAULT_EMPLOYEE_ID,
        id: optimisticId,
        status: "confirmed",
        createdAt: now,
        updatedAt: now,
      }
      snapshots.forEach(([queryKey, current]) => {
        if (!current || queryKey[1] !== "list") return
        const filters = queryKey[2] as IBookingFilters | undefined
        if (matchesBookingFilters(optimistic, filters))
          queryClient.setQueryData(queryKey, {
            ...current,
            items: [optimistic, ...current.items],
            total: current.total + 1,
          })
      })

      return { snapshots, optimisticId }
    },
    onError: (_error, _input, context) =>
      context?.snapshots.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data)),
    onSuccess: (created, _input, context) =>
      queryClient.setQueriesData<IPaginatedResponse<IBooking>>(
        { queryKey: ["bookings", "list"] },
        (current) =>
          current
            ? {
                ...current,
                items: current.items.map((booking) =>
                  booking.id === context?.optimisticId ? created : booking
                ),
              }
            : current
      ),
    onSettled: () => invalidateBookings(queryClient),
  })
}
