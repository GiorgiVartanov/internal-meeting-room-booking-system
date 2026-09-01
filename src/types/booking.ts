import type { TRoomId } from "./room"

export type TBookingId = string
export type TEmployeeId = string
export type TBookingStatus = "confirmed" | "cancelled"

export interface IBooking {
  id: TBookingId
  roomId: TRoomId
  organizerId: TEmployeeId
  title: string
  startAt: string
  endAt: string
  attendeeIds: TEmployeeId[]
  notes?: string
  status: TBookingStatus
  createdAt: string
  updatedAt: string
  cancelledAt?: string
}

export interface IBookingFilters {
  roomId?: TRoomId
  roomIds?: TRoomId[]
  organizerId?: TEmployeeId
  organizerIds?: TEmployeeId[]
  participantId?: TEmployeeId
  search?: string
  from?: string
  to?: string
  status?: TBookingStatus
  capacity?: import("./room").TCapacityBucket[]
  amenities?: import("./room").TRoomAmenity[]
  page?: number
  pageSize?: number
}

export interface IBookingDayActivity {
  date: string
  availability: "empty" | "low" | "medium" | "high" | "full"
}

export interface ICreateBookingInput {
  roomId: TRoomId
  title: string
  startAt: string
  endAt: string
  attendeeIds: TEmployeeId[]
  notes?: string
}

export interface IUpdateBookingInput {
  roomId?: TRoomId
  title?: string
  startAt?: string
  endAt?: string
  attendeeIds?: TEmployeeId[]
  notes?: string
}

export interface IUpdateBookingRequest {
  bookingId: TBookingId
  changes: IUpdateBookingInput
}
