import { addMonths, differenceInMinutes, isWeekend, subMinutes } from "date-fns"
import { http, HttpResponse } from "msw"

import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  APP_TIME_ZONE,
  BOOKING_HORIZON_MONTHS,
  BOOKING_PAST_GRACE_MINUTES,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  BOOKING_SLOT_MINUTES,
  WORKING_HOURS,
  PATHS,
} from "@/constants"
import {
  bookingRepository,
  employeeRepository,
  holidayRepository,
  roomRepository,
} from "@/mocks/db/repositories"
import type { IBooking, IBookingFilters, ICreateBookingInput, IUpdateBookingInput } from "@/types"
import { localize } from "@/lib/localize"
import { matchesCapacityBuckets } from "@/lib/roomCapacity"
import { createBookingSchema, updateBookingSchema } from "@/mocks/domain/bookingSchemas"

const error = (message: string, code: string, status: number) =>
  HttpResponse.json({ message, code }, { status })

const invalidRequest = (issues: { path: PropertyKey[]; message: string }[]) =>
  HttpResponse.json(
    {
      message: "The request contains invalid fields.",
      code: "INVALID_REQUEST",
      fieldErrors: Object.fromEntries(
        issues.map((issue) => [issue.path.join(".") || "request", issue.message])
      ),
    },
    { status: 422 }
  )

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

const localDate = (date: Date) => dateFormatter.format(date)

const localClockMinutes = (date: Date) => {
  const parts = clockFormatter.formatToParts(date)

  const value = (type: "hour" | "minute") =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return value("hour") * 60 + value("minute")
}

export const validateBooking = (
  input: (ICreateBookingInput & { organizerId: string }) | IBooking,
  ignoredId?: string
) => {
  const start = new Date(input.startAt)
  const end = new Date(input.endAt)
  const now = new Date()

  if (!localize(input.title, "en").trim()) return "A booking title is required."

  const room = roomRepository.get(input.roomId)

  if (!room) return "The selected room does not exist."

  if (!employeeRepository.list().some((employee) => employee.id === input.organizerId))
    return "The organizer does not exist."

  if (new Set(input.attendeeIds).size !== input.attendeeIds.length)
    return "A person cannot be added as an attendee more than once."

  if (input.attendeeIds.includes(input.organizerId))
    return "The organizer cannot also be an attendee."

  if (
    input.attendeeIds.some(
      (attendeeId) => !employeeRepository.list().some((employee) => employee.id === attendeeId)
    )
  )
    return "One or more selected attendees do not exist."
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()))
    return "Start and end times must be valid."

  const duration = differenceInMinutes(end, start)
  if (duration < MIN_BOOKING_DURATION_MINUTES || duration > MAX_BOOKING_DURATION_MINUTES) {
    return `Booking duration must be between ${MIN_BOOKING_DURATION_MINUTES} and ${MAX_BOOKING_DURATION_MINUTES} minutes.`
  }
  const startMinutes = localClockMinutes(start)
  const endMinutes = localClockMinutes(end)
  if (
    localDate(start) !== localDate(end) ||
    startMinutes < WORKING_HOURS.start * 60 ||
    endMinutes > WORKING_HOURS.end * 60
  )
    return "Bookings must fit within working hours."
  if (startMinutes % BOOKING_SLOT_MINUTES !== 0 || endMinutes % BOOKING_SLOT_MINUTES !== 0)
    return "Booking times must align with the booking slot interval."
  if (input.attendeeIds.length + 1 > room.capacity) return "The room does not have enough capacity."
  if (start < subMinutes(now, BOOKING_PAST_GRACE_MINUTES))
    return "The booking starts too far in the past."
  if (start > addMonths(now, BOOKING_HORIZON_MONTHS))
    return "The booking is outside the booking horizon."
  if (!ALLOW_WEEKEND_BOOKINGS && isWeekend(new Date(`${localDate(start)}T12:00:00`)))
    return "Weekend bookings are disabled."
  if (
    !ALLOW_HOLIDAY_BOOKINGS &&
    holidayRepository.list().some((holiday) => holiday.date === localDate(start))
  ) {
    return "Bookings are disabled on Georgian public holidays."
  }

  const confirmedBookings = bookingRepository
    .list()
    .filter((booking) => booking.id !== ignoredId && booking.status === "confirmed")
  const overlaps = confirmedBookings.some(
    (booking) =>
      booking.roomId === input.roomId &&
      start < new Date(booking.endAt) &&
      end > new Date(booking.startAt)
  )

  return overlaps ? "This room is already booked during the selected time." : undefined
}

const paginatedBookings = (request: Request, overrides: IBookingFilters = {}) => {
  const params = new URL(request.url).searchParams
  const filters: IBookingFilters = {
    roomId: params.get("roomId") ?? undefined,
    roomIds: params.get("roomIds")?.split(",").filter(Boolean),
    organizerId: params.get("organizerId") ?? undefined,
    organizerIds: params.get("organizerIds")?.split(",").filter(Boolean),
    participantId: params.get("participantId") ?? undefined,
    search: params.get("search") ?? undefined,
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    status: (params.get("status") as IBookingFilters["status"]) ?? undefined,
    capacity: params.get("capacity")?.split(",").filter(Boolean) as IBookingFilters["capacity"],
    amenities: params.get("amenities")?.split(",").filter(Boolean) as IBookingFilters["amenities"],
    ...overrides,
  }
  const search = filters.search?.toLocaleLowerCase()
  const page = Math.max(1, Number(params.get("page")) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 50))
  const rooms = roomRepository.list()
  const employees = employeeRepository.list()

  const capacityMatches = (capacity: number) => matchesCapacityBuckets(capacity, filters.capacity)
  const bookings = bookingRepository
    .list()
    .filter((booking) => {
      const room = rooms.find((item) => item.id === booking.roomId)
      const employee = employees.find((item) => item.id === booking.organizerId)
      const startMinutes = localClockMinutes(new Date(booking.startAt))
      const displayedStart = `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(
        startMinutes % 60
      ).padStart(2, "0")}`
      const searchable =
        `${localize(booking.title, "en")} ${localize(booking.title, "ka")} ${room ? `${room.name.en} ${room.name.ka}` : ""} ${employee ? `${employee.name.en} ${employee.name.ka}` : ""} ${localDate(new Date(booking.startAt))} ${displayedStart} ${booking.startAt}`.toLocaleLowerCase()
      const roomMatches =
        !room ||
        (capacityMatches(room.capacity) &&
          (!filters.amenities?.length ||
            filters.amenities.every((amenity) => room.amenities.includes(amenity))))

      return (
        (!filters.roomId || booking.roomId === filters.roomId) &&
        (!filters.roomIds?.length || filters.roomIds.includes(booking.roomId)) &&
        (!filters.organizerId || booking.organizerId === filters.organizerId) &&
        (!filters.organizerIds?.length || filters.organizerIds.includes(booking.organizerId)) &&
        (!filters.participantId ||
          booking.organizerId === filters.participantId ||
          booking.attendeeIds.includes(filters.participantId)) &&
        (!filters.status || booking.status === filters.status) &&
        (!filters.from || booking.endAt >= filters.from) &&
        (!filters.to || booking.startAt <= filters.to) &&
        (!search || searchable.includes(search)) &&
        roomMatches
      )
    })
    .sort((a, b) => b.startAt.localeCompare(a.startAt))
  const total = bookings.length

  return HttpResponse.json({
    items: bookings.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  })
}

export const bookingHandlers = [
  http.get(PATHS.mockApi.bookingSearch, ({ request }) => paginatedBookings(request)),
  http.get(PATHS.mockApi.roomBookingsPattern, ({ params, request }) =>
    paginatedBookings(request, { roomId: String(params.roomId) })
  ),
  http.get(PATHS.mockApi.employeeBookingsPattern, ({ params, request }) =>
    paginatedBookings(request, { participantId: String(params.employeeId) })
  ),
  http.get(PATHS.mockApi.bookings, ({ request }) => paginatedBookings(request)),
  http.get(PATHS.mockApi.bookingPattern, ({ params }) => {
    const booking = bookingRepository.get(String(params.bookingId))

    return booking
      ? HttpResponse.json(booking)
      : error("Booking not found.", "BOOKING_NOT_FOUND", 404)
  }),
  http.post(PATHS.mockApi.bookings, async ({ request }) => {
    const employeeId = request.headers.get("X-Employee-Id")
    if (!employeeId || !employeeRepository.list().some((employee) => employee.id === employeeId))
      return error("A valid employee identity is required.", "EMPLOYEE_UNAUTHORIZED", 401)
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return error("The request body must be valid JSON.", "INVALID_JSON", 400)
    }
    const parsed = createBookingSchema.safeParse(body)
    if (!parsed.success) return invalidRequest(parsed.error.issues)
    const input: ICreateBookingInput = parsed.data
    const bookingError = validateBooking({ ...input, organizerId: employeeId })
    if (bookingError) return error(bookingError, "INVALID_BOOKING", 422)

    return HttpResponse.json(bookingRepository.create(input, employeeId), { status: 201 })
  }),
  http.patch(PATHS.mockApi.bookingPattern, async ({ params, request }) => {
    const bookingId = String(params.bookingId)
    const current = bookingRepository.get(bookingId)
    if (!current) return error("Booking not found.", "BOOKING_NOT_FOUND", 404)
    if (current.organizerId !== request.headers.get("X-Employee-Id"))
      return error("Only the organizer can edit this booking.", "BOOKING_FORBIDDEN", 403)
    if (current.status === "cancelled")
      return error("Cancelled bookings cannot be edited.", "BOOKING_CANCELLED", 409)
    if (new Date(current.endAt) <= new Date())
      return error("Ended bookings cannot be edited.", "BOOKING_ENDED", 409)
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return error("The request body must be valid JSON.", "INVALID_JSON", 400)
    }
    const parsed = updateBookingSchema.safeParse(body)
    if (!parsed.success) return invalidRequest(parsed.error.issues)
    const changes: IUpdateBookingInput = parsed.data
    const bookingError = validateBooking({ ...current, ...changes }, bookingId)
    if (bookingError) return error(bookingError, "INVALID_BOOKING", 422)

    return HttpResponse.json(bookingRepository.update(bookingId, changes))
  }),
  http.delete(PATHS.mockApi.bookingPattern, ({ params, request }) => {
    const bookingId = String(params.bookingId)
    const current = bookingRepository.get(bookingId)
    if (!current) return error("Booking not found.", "BOOKING_NOT_FOUND", 404)
    if (current.organizerId !== request.headers.get("X-Employee-Id"))
      return error("Only the organizer can cancel this booking.", "BOOKING_FORBIDDEN", 403)
    if (current.status === "cancelled")
      return error("This booking is already cancelled.", "BOOKING_CANCELLED", 409)
    if (new Date(current.endAt) <= new Date())
      return error("Ended bookings cannot be cancelled.", "BOOKING_ENDED", 409)
    bookingRepository.cancel(bookingId)

    return new HttpResponse(null, { status: 204 })
  }),
]
