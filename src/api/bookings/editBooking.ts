import { patch } from "@/api/api"
import type { IBooking, IUpdateBookingInput, IUpdateBookingRequest } from "@/types"
import { PATHS } from "@/constants"

export const editBooking = ({ bookingId, changes }: IUpdateBookingRequest) =>
  patch<IBooking, IUpdateBookingInput>(PATHS.api.booking(bookingId), changes)
