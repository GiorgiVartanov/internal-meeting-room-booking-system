import { del } from "@/api/api"
import type { TBookingId } from "@/types"
import { PATHS } from "@/constants"

export const deleteBooking = (bookingId: TBookingId) => del<void>(PATHS.api.booking(bookingId))
