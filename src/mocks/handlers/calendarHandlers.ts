import { http, HttpResponse } from "msw"

import { PATHS, WORKING_HOURS } from "@/constants"
import { appClockMinutes, appDateKey } from "@/lib/date"
import {
  bookingRepository,
  employeeRepository,
  holidayRepository,
  roomRepository,
} from "@/mocks/db/repositories"
import type { IBookingDayActivity } from "@/types"

const availabilityFor = (
  fullyOccupied: boolean,
  utilization: number
): IBookingDayActivity["availability"] => {
  if (fullyOccupied) return "full"
  if (utilization >= 0.75) return "high"
  if (utilization >= 0.4) return "medium"

  return "low"
}

const ACTIVITY_SLOT_MINUTES = 30
const ACTIVITY_SLOT_COUNT = ((WORKING_HOURS.end - WORKING_HOURS.start) * 60) / ACTIVITY_SLOT_MINUTES

export const calendarHandlers = [
  http.get(PATHS.mockApi.employees, () => HttpResponse.json(employeeRepository.list())),
  http.get(PATHS.mockApi.holidays, () => HttpResponse.json(holidayRepository.list())),
  http.get(PATHS.mockApi.bookingActivity, ({ request }) => {
    const organizerId = new URL(request.url).searchParams.get("organizerId")
    const participantId = new URL(request.url).searchParams.get("participantId")
    const rooms = roomRepository.list().filter((room) => room.isActive)
    const bookings = bookingRepository
      .list()
      .filter(
        (booking) =>
          booking.status === "confirmed" &&
          (!organizerId || booking.organizerId === organizerId) &&
          (!participantId ||
            booking.organizerId === participantId ||
            booking.attendeeIds.includes(participantId))
      )
    const activity = bookings.reduce<Record<string, Array<Set<string>>>>((result, booking) => {
      const key = appDateKey(booking.startAt)
      const occupiedBySlot =
        result[key] ?? Array.from({ length: ACTIVITY_SLOT_COUNT }, () => new Set<string>())
      const bookingStart = appClockMinutes(booking.startAt)
      const bookingEnd = appClockMinutes(booking.endAt)
      occupiedBySlot.forEach((occupiedRooms, index) => {
        const slotStart = WORKING_HOURS.start * 60 + index * ACTIVITY_SLOT_MINUTES
        if (bookingStart < slotStart + ACTIVITY_SLOT_MINUTES && bookingEnd > slotStart)
          occupiedRooms.add(booking.roomId)
      })
      result[key] = occupiedBySlot

      return result
    }, {})

    return HttpResponse.json(
      Object.entries(activity).map(([date, occupiedRoomsBySlot]) => {
        const occupiedBySlot = occupiedRoomsBySlot.map((occupiedRooms) => occupiedRooms.size)
        const utilization =
          occupiedBySlot.reduce((total, occupied) => total + occupied, 0) /
          Math.max(1, occupiedBySlot.length * rooms.length)
        const availability = availabilityFor(
          occupiedBySlot.every((occupied) => occupied >= rooms.length),
          utilization
        )

        return { date, availability }
      })
    )
  }),
]
