import { useQuery } from "@tanstack/react-query"

import { getBookingActivity } from "@/api"
import { BOOKING_ACTIVITY_STALE_TIME_MILLISECONDS } from "@/constants"

export const useBookingActivity = (
  filters: { organizerId?: string; participantId?: string } = {},
  enabled = true
) =>
  useQuery({
    queryKey: ["booking-activity", filters],
    queryFn: () => getBookingActivity(filters),
    staleTime: BOOKING_ACTIVITY_STALE_TIME_MILLISECONDS,
    enabled,
  })
