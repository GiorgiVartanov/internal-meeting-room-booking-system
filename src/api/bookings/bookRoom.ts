import { post } from "@/api/api"
import type { IBooking, ICreateBookingInput } from "@/types"
import { PATHS } from "@/constants"

export const bookRoom = (input: ICreateBookingInput) =>
  post<IBooking, ICreateBookingInput>(PATHS.api.bookings, input)
