import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteBooking } from "@/api"

import { invalidateBookings } from "./bookingMutationUtils"

export const useDeleteBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBooking,
    onSettled: () => invalidateBookings(queryClient),
  })
}
