import {
  addDays,
  addWeeks,
  format,
  isSameMonth,
  isValid,
  isWeekend,
  nextMonday,
  parseISO,
  startOfWeek,
} from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/api"
import { Button } from "@/components/ui/button"
import { ApiErrorAlert } from "@/components/ApiErrorAlert"
import { DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"
import { ScheduleCalendarDialog } from "@/features/calendar"
import {
  BookingDetailsDialog,
  EditableBookingDialog,
  PersonalWeekTimeline,
} from "@/features/schedule"
import {
  prefetchEmployeeBookingPages,
  employeeWeekBookingParams,
  useBooking,
  useEditBooking,
  useEmployeeWeekBookings,
  usePagedBookings,
  usePrefetchBooking,
  useBookingActivity,
  useEmployees,
  useHolidays,
  useRooms,
  useTimelineNow,
} from "@/hooks"
import { appCalendarDate, appDateKey, dateKey, dateLocale, fromDateAndTime } from "@/lib/date"

import type { ReactElement } from "react"

/** Selects the current work week, advancing weekend dates to Monday. */
const defaultWeek = (today: Date): Date =>
  isWeekend(today) ? nextMonday(today) : startOfWeek(today, { weekStartsOn: 1 })

/** Displays and manages the current employee's weekly booking schedule. */
const SchedulePage = (): ReactElement => {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const now = useTimelineNow()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const queryClient = useQueryClient()

  const requestedWeek = parseISO(params.get("week") ?? "")
  const weekStart = isValid(requestedWeek)
    ? startOfWeek(requestedWeek, { weekStartsOn: 1 })
    : defaultWeek(appCalendarDate(now))
  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index))
  const locale = dateLocale(i18n.language)
  const range = isSameMonth(weekStart, weekEnd)
    ? `${format(weekStart, "MMMM d", { locale })} - ${format(weekEnd, "d, yyyy", { locale })}`
    : `${format(weekStart, "MMMM d", { locale })} - ${format(weekEnd, "MMMM d, yyyy", { locale })}`

  const bookings = useEmployeeWeekBookings(
    employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, weekStart)
  )
  const rooms = useRooms()
  const employees = useEmployees()
  const holidays = useHolidays()
  const weekBookings = usePagedBookings({
    status: "confirmed",
    from: fromDateAndTime(dateKey(weekStart), "00:00"),
    to: fromDateAndTime(dateKey(addDays(weekStart, 4)), "23:59"),
  })
  const editBooking = useEditBooking()
  const activity = useBookingActivity({ participantId: DEFAULT_EMPLOYEE_ID }, calendarOpen)

  const selectedBookingId = params.get("booking") ?? undefined
  const listedBooking = bookings.data?.find((booking) => booking.id === selectedBookingId)

  const bookingDetail = useBooking(selectedBookingId, listedBooking)
  const prefetchBooking = usePrefetchBooking()

  const selectedBooking = bookingDetail.data

  useEffect(() => {
    void prefetchEmployeeBookingPages(
      queryClient,
      employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, addWeeks(weekStart, -1))
    )
    void prefetchEmployeeBookingPages(
      queryClient,
      employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, addWeeks(weekStart, 1))
    )
  }, [queryClient, weekStart])

  const update = (changes: Record<string, string | undefined>): void => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key)
    )
    setParams(next, { replace: true })
  }
  const selectWeek = (date: Date): void => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const current = defaultWeek(appCalendarDate(now))

    update({
      week: dateKey(start) === dateKey(current) ? undefined : dateKey(start),
      booking: undefined,
      bookingEdit: undefined,
    })
  }

  const selectedRoom = rooms.data?.find((room) => room.id === selectedBooking?.roomId)
  const organizer = employees.data?.find((employee) => employee.id === selectedBooking?.organizerId)
  const attendees = employees.data?.filter((employee) =>
    selectedBooking?.attendeeIds.includes(employee.id)
  )
  const canEdit = Boolean(
    selectedBooking?.organizerId === DEFAULT_EMPLOYEE_ID && new Date(selectedBooking.endAt) > now
  )
  const editingSelected = canEdit && params.get("bookingEdit") === "true"
  const bookingHref = selectedBooking
    ? `${PATHS.room(selectedBooking.roomId)}&date=${appDateKey(selectedBooking.startAt)}&booking=${selectedBooking.id}`
    : undefined

  const scheduleLoading =
    bookings.isPending || weekBookings.isPending || rooms.isPending || employees.isPending
  const scheduleError = bookings.error ?? weekBookings.error ?? rooms.error ?? employees.error
  let scheduleBody: ReactElement

  if (scheduleLoading) {
    scheduleBody = (
      <div
        className="min-h-0 flex-1 border"
        aria-busy="true"
      >
        <span className="sr-only">{t("loading")}</span>
      </div>
    )
  } else if (scheduleError) {
    scheduleBody = (
      <ApiErrorAlert
        error={scheduleError}
        fallback={t("loadError")}
      />
    )
  } else {
    scheduleBody = (
      <div
        data-guide="personal-timeline"
        className="shrink-0"
      >
        <PersonalWeekTimeline
          days={days}
          bookings={bookings.data ?? []}
          collisionBookings={weekBookings.data ?? []}
          dragEnabled={!weekBookings.isFetching && !weekBookings.hasNextPage}
          rooms={rooms.data ?? []}
          employees={employees.data ?? []}
          now={now}
          onBooking={(booking) => update({ booking: booking.id })}
          onEditBooking={(booking) => update({ booking: booking.id, bookingEdit: "true" })}
          onPrefetchBooking={(bookingId) => void prefetchBooking(bookingId)}
        />
      </div>
    )
  }

  return (
    <main className="flex h-[calc(100dvh-4rem)] min-h-[calc(100dvh-4rem)] w-full flex-col gap-2 overflow-y-scroll p-2 [scrollbar-gutter:stable]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold capitalize sm:text-xl">
          {t("weekOfRange", { range })}
        </h1>
        <div
          data-guide="week-navigation"
          className="flex flex-wrap items-center gap-1 sm:gap-2"
        >
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t("previousWeek")}
            onPointerEnter={() =>
              void prefetchEmployeeBookingPages(
                queryClient,
                employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, addWeeks(weekStart, -1))
              )
            }
            onClick={() => selectWeek(addWeeks(weekStart, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => selectWeek(defaultWeek(appCalendarDate(now)))}
          >
            {t("currentWeek")}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label={t("nextWeek")}
            onPointerEnter={() =>
              void prefetchEmployeeBookingPages(
                queryClient,
                employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, addWeeks(weekStart, 1))
              )
            }
            onClick={() => selectWeek(addWeeks(weekStart, 1))}
          >
            <ChevronRight />
          </Button>
          <Button
            data-modal-opener="calendar"
            type="button"
            variant="outline"
            onClick={() => setCalendarOpen(true)}
          >
            <CalendarDays />
            <span className="hidden sm:inline">{t("chooseWeek")}</span>
          </Button>
        </div>
      </header>
      {scheduleBody}
      <ScheduleCalendarDialog
        open={calendarOpen}
        selected={weekStart}
        selectedWeekStart={weekStart}
        title={t("chooseWeek")}
        showMineFilter={false}
        activity={activity.data ?? []}
        myActivity={activity.data ?? []}
        holidays={holidays.data ?? []}
        onOpenChange={setCalendarOpen}
        onSelect={selectWeek}
      />
      <BookingDetailsDialog
        key={selectedBookingId}
        booking={selectedBooking}
        room={selectedRoom}
        employee={organizer}
        attendees={attendees}
        loading={bookingDetail.isPending}
        open={Boolean(selectedBookingId) && !editingSelected}
        scheduleHref={bookingHref}
        onEdit={canEdit ? () => update({ bookingEdit: "true" }) : undefined}
        onOpenChange={(open) => !open && update({ booking: undefined, bookingEdit: undefined })}
      />
      <EditableBookingDialog
        booking={selectedBooking}
        rooms={rooms.data ?? []}
        bookings={weekBookings.data ?? []}
        employees={employees.data ?? []}
        holidays={holidays.data ?? []}
        open={Boolean(editingSelected)}
        pending={editBooking.isPending}
        errorMessage={
          editBooking.error ? getApiErrorMessage(editBooking.error, t("bookingFailed")) : undefined
        }
        onSave={async (changes) => {
          if (!selectedBooking) return
          const updated = await editBooking.mutateAsync({
            bookingId: selectedBooking.id,
            changes,
          })
          const updatedWeek = startOfWeek(new Date(updated.startAt), { weekStartsOn: 1 })
          const currentWeek = defaultWeek(appCalendarDate())
          update({
            week: dateKey(updatedWeek) === dateKey(currentWeek) ? undefined : dateKey(updatedWeek),
            booking: updated.id,
            bookingEdit: undefined,
          })
        }}
        onOpenChange={(open) => !open && update({ booking: undefined, bookingEdit: undefined })}
      />
    </main>
  )
}

export default SchedulePage
