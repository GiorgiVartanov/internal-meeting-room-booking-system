import bookingsSeed from "@/mocks/data/bookings.json"
import roomsSeed from "@/mocks/data/rooms.json"
import employeesSeed from "@/mocks/data/employees.json"
import holidaysSeed from "@/mocks/data/holidays.json"
import { expandGeorgianHolidayRules } from "@/mocks/domain/georgianHolidays"
import type {
  IBooking,
  ICreateBookingInput,
  IEmployee,
  IRoom,
  IUpdateBookingInput,
  TBookingId,
} from "@/types"

import { readCollection, writeCollection } from "./storage"

export const roomRepository = {
  list: () => readCollection<IRoom>("rooms", roomsSeed as IRoom[]),
  get: (id: string) => roomRepository.list().find((room) => room.id === id),
}

export const employeeRepository = {
  list: () => readCollection<IEmployee>("employees", employeesSeed as IEmployee[]),
}
export const holidayRepository = {
  list: () => {
    const currentYear = new Date().getUTCFullYear()

    return expandGeorgianHolidayRules(holidaysSeed, currentYear - 2, currentYear + 3)
  },
}

export const bookingRepository = {
  list: () => readCollection<IBooking>("bookings", bookingsSeed as IBooking[]),
  get: (id: TBookingId) => bookingRepository.list().find((booking) => booking.id === id),
  create: (input: ICreateBookingInput, organizerId: string) => {
    const now = new Date().toISOString()
    const booking: IBooking = {
      ...input,
      organizerId,
      id: crypto.randomUUID(),
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    }
    const bookings = [...bookingRepository.list(), booking]
    writeCollection("bookings", bookings)

    return booking
  },
  update: (id: TBookingId, changes: IUpdateBookingInput) => {
    const bookings = bookingRepository.list()
    const current = bookings.find((booking) => booking.id === id)
    if (!current) return undefined
    const updated: IBooking = { ...current, ...changes, updatedAt: new Date().toISOString() }
    writeCollection(
      "bookings",
      bookings.map((booking) => (booking.id === id ? updated : booking))
    )

    return updated
  },
  cancel: (id: TBookingId) => {
    const bookings = bookingRepository.list()
    const current = bookings.find((booking) => booking.id === id)
    if (!current) return undefined
    const cancelledAt = new Date().toISOString()
    const cancelled: IBooking = {
      ...current,
      status: "cancelled",
      cancelledAt,
      updatedAt: cancelledAt,
    }
    writeCollection(
      "bookings",
      bookings.map((booking) => (booking.id === id ? cancelled : booking))
    )

    return cancelled
  },
}
