import { useQuery } from "@tanstack/react-query"

import { getBookingActivity } from "@/api"

export const useBookingActivity = (
  filters: { organizerId?: string; participantId?: string } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ["booking-activity", filters],
    queryFn: () => getBookingActivity(filters),
    staleTime: 60_000,
    enabled,
  })
