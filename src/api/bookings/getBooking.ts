import { get } from "@/api/api"
import type { IBooking, TBookingId } from "@/types"
import { PATHS } from "@/constants"

export const getBooking = (bookingId: TBookingId) => get<IBooking>(PATHS.api.booking(bookingId))
