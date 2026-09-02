import { addDays, isValid, isWeekend, parseISO } from "date-fns"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useSearchParams } from "react-router-dom"

import { getApiErrorMessage } from "@/api/api"
import { ApiErrorAlert } from "@/components/ApiErrorAlert"
import { Card, CardContent } from "@/components/ui/card"
import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  DEFAULT_EMPLOYEE_ID,
  PATHS,
} from "@/constants"
import { BookingCalendar, CalendarMineFilter } from "@/features/calendar"
import {
  DashboardCalendarSkeleton,
  DashboardDayDrawer,
  DashboardDayPanel,
  type TDashboardDayTab,
} from "@/features/dashboard"
import { ResizableDashboardLayout } from "@/features/layout"
import { BookingDetailsDialog, EditableBookingDialog } from "@/features/schedule"
import {
  useBookingActivity,
  useEditBooking,
  useEmployees,
  useHolidays,
  usePagedBookings,
  useRooms,
} from "@/hooks"
import { appCalendarDate, appDateKey, dateKey, fromDateAndTime } from "@/lib/date"
import type { IBooking, IRoom } from "@/types"

import type { ReactElement } from "react"

/** Presents booking activity and room availability for calendar-selected dates. */
const DashboardPage = (): ReactElement => {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const [mobile, setMobile] = useState((): boolean => matchMedia("(max-width: 1023px)").matches)

  useEffect(() => {
    const query = matchMedia("(max-width: 1023px)")
    const change = (): void => setMobile(query.matches)
    query.addEventListener("change", change)

    return () => query.removeEventListener("change", change)
  }, [])

  const rooms = useRooms()
  const holidays = useHolidays()
  const employees = useEmployees()
  const editBooking = useEditBooking()

  const defaultDate = (() => {
    let candidate = appCalendarDate()
    while (
      (!ALLOW_WEEKEND_BOOKINGS && isWeekend(candidate)) ||
      (!ALLOW_HOLIDAY_BOOKINGS &&
        holidays.data?.some((holiday) => holiday.date === dateKey(candidate)))
    )
      candidate = addDays(candidate, 1)

    return candidate
  })()
  const requestedDateValue = params.get("date")
  const parsedDate = requestedDateValue ? parseISO(requestedDateValue) : undefined
  const dateValue = parsedDate && isValid(parsedDate) ? dateKey(parsedDate) : dateKey(defaultDate)
  const requestedDate = new Date(`${dateValue}T12:00:00`)
  const blockedDate =
    (!ALLOW_WEEKEND_BOOKINGS && isWeekend(requestedDate)) ||
    (!ALLOW_HOLIDAY_BOOKINGS && holidays.data?.some((holiday) => holiday.date === dateValue))
  const selectedDate = blockedDate ? undefined : requestedDate
  const panelOpen = Boolean(selectedDate) && params.get("dayPanel") !== "closed"
  const activeTab: TDashboardDayTab = params.get("dayTab") === "bookings" ? "bookings" : "rooms"
  const onlyMine = params.get("dayMine") === "true"

  const activity = useBookingActivity(onlyMine ? { participantId: DEFAULT_EMPLOYEE_ID } : {})
  const dayBookings = usePagedBookings({
    status: "confirmed",
    from: fromDateAndTime(dateValue, "00:00"),
    to: fromDateAndTime(dateValue, "23:59"),
  })

  const requestedRoom = rooms.data?.find((room) => room.id === params.get("room"))
  const selectedRoom =
    requestedRoom && dayBookings.data?.some((booking) => booking.roomId === requestedRoom.id)
      ? requestedRoom
      : undefined
  const selectedBooking = dayBookings.data?.find(
    (booking) => booking.id === params.get("dashboardBooking")
  )
  const selectedBookingRoom = rooms.data?.find((room) => room.id === selectedBooking?.roomId)
  const canEditSelected = Boolean(
    selectedBooking?.organizerId === DEFAULT_EMPLOYEE_ID &&
    new Date(selectedBooking.endAt) > new Date()
  )
  const editingSelected = canEditSelected && params.get("dashboardBookingEdit") === "true"

  const update = (changes: Record<string, string | undefined>): void => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key)
    )
    setParams(next)
  }

  useEffect(() => {
    if (!requestedDateValue || requestedDateValue === dateValue) return
    const next = new URLSearchParams(params)
    next.set("date", dateValue)
    setParams(next, { replace: true })
  }, [dateValue, params, requestedDateValue, setParams])

  useEffect(() => {
    if (
      params.get("guide") !== "dashboard" ||
      !["rooms-tab", "bookings-tab"].includes(params.get("guideStep") ?? "") ||
      params.has("date") ||
      !matchMedia("(max-width: 1023px)").matches
    )
      return
    const next = new URLSearchParams(params)
    next.set("date", dateValue)
    setParams(next, { replace: true })
  }, [dateValue, params, setParams])

  useEffect(() => {
    if (params.get("guide") !== "dashboard") return
    const step = params.get("guideStep")
    if (step !== "rooms-tab" && step !== "bookings-tab") return
    const requestedTab = step === "bookings-tab" ? "bookings" : "rooms"
    if (activeTab === requestedTab) return
    const next = new URLSearchParams(params)
    next.set("dayTab", requestedTab)
    setParams(next, { replace: true })
  }, [activeTab, params, setParams])
  const panelProps = {
    date: panelOpen ? selectedDate : undefined,
    dateValue,
    rooms: rooms.data ?? [],
    bookings: dayBookings.data ?? [],
    loading: dayBookings.isPending,
    employees: employees.data ?? [],
    selectedRoom,
    activeTab,
    onlyMine,
    mobileOpen: params.has("date") && panelOpen,
    onClose: () => update({ dayPanel: "closed", room: undefined }),
    onRoom: (room?: IRoom) => update({ room: room?.id }),
    onTab: (tab: TDashboardDayTab) =>
      update({ dayTab: tab === "bookings" ? tab : undefined, room: undefined }),
    onBooking: (booking: IBooking) => update({ dashboardBooking: booking.id }),
    onEditBooking: (booking: IBooking) =>
      update({ dashboardBooking: booking.id, dashboardBookingEdit: "true" }),
  }

  const calendarFilter = (
    <CalendarMineFilter
      selected={onlyMine}
      onToggle={() => update({ dayMine: onlyMine ? undefined : "true" })}
    />
  )
  let calendarBodyFallback: ReactElement | undefined
  if (activity.isError || holidays.isError) {
    calendarBodyFallback = (
      <ApiErrorAlert
        error={activity.error ?? holidays.error}
        fallback={t("loadError")}
      />
    )
  } else if (activity.isPending || holidays.isPending) {
    calendarBodyFallback = <DashboardCalendarSkeleton />
  }

  const calendar = (
    <Card
      data-guide="dashboard-calendar"
      className="h-full min-h-0 w-full gap-0 bg-panel p-0"
    >
      <CardContent className="h-full min-h-0 bg-panel p-2">
        <BookingCalendar
          large
          fillWidth
          horizontalYearScroll
          showMonthPickerTitle={false}
          disablePast={false}
          dayClassName="bg-panel"
          headerClassName="bg-panel"
          headerActions={calendarFilter}
          bodyFallback={calendarBodyFallback}
          activity={activity.data ?? []}
          holidays={holidays.data ?? []}
          showTodayButton={false}
          selected={mobile && !params.has("date") ? undefined : selectedDate}
          onSelect={(date) =>
            update({
              date: dateKey(date),
              dayPanel: undefined,
              room: undefined,
              dashboardBooking: undefined,
            })
          }
        />
      </CardContent>
    </Card>
  )

  return (
    <main className="h-[calc(100dvh-4rem)] w-full overflow-hidden p-2">
      <ResizableDashboardLayout
        calendar={calendar}
        sidebar={panelOpen ? <DashboardDayPanel {...panelProps} /> : undefined}
      />
      <DashboardDayDrawer {...panelProps} />
      <BookingDetailsDialog
        key={params.get("dashboardBooking") ?? undefined}
        booking={selectedBooking}
        room={selectedBookingRoom}
        employee={employees.data?.find((employee) => employee.id === selectedBooking?.organizerId)}
        attendees={employees.data?.filter((employee) =>
          selectedBooking?.attendeeIds.includes(employee.id)
        )}
        open={Boolean(selectedBooking) && !editingSelected}
        scheduleHref={
          selectedBooking
            ? `${PATHS.room(selectedBooking.roomId)}&date=${dateValue}&booking=${selectedBooking.id}&returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`
            : undefined
        }
        onEdit={canEditSelected ? () => update({ dashboardBookingEdit: "true" }) : undefined}
        onOpenChange={(open) =>
          !open && update({ dashboardBooking: undefined, dashboardBookingEdit: undefined })
        }
      />
      <EditableBookingDialog
        booking={selectedBooking}
        rooms={rooms.data ?? []}
        bookings={dayBookings.data ?? []}
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
          update({
            date: appDateKey(updated.startAt),
            room: undefined,
            dashboardBooking: updated.id,
            dashboardBookingEdit: undefined,
          })
        }}
        onOpenChange={(open) =>
          !open && update({ dashboardBooking: undefined, dashboardBookingEdit: undefined })
        }
      />
    </main>
  )
}

export default DashboardPage
