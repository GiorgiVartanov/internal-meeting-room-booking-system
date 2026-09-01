import { Clock3, SlidersHorizontal, Sparkles } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { getApiErrorMessage } from "@/api/api"
import { ApiErrorAlert } from "@/components/ApiErrorAlert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScheduleCalendarDialog } from "@/features/calendar"
import { ResizableScheduleLayout } from "@/features/layout"
import { RoomCard, RoomsSidebar } from "@/features/rooms"
import { BookingDetailsDialog, EditableBookingDialog, ScheduleSidebar } from "@/features/schedule"
import { BookingSearchDialog } from "@/features/search"
import {
  useBooking,
  useEditBooking,
  usePagedBookings,
  useRoomBookings,
  useBookingActivity,
  useEmployees,
  useHolidays,
  useRooms,
  useScheduleUrl,
} from "@/hooks"
import { appDateKey, dateKey, fromDateAndTime } from "@/lib/date"
import { localize } from "@/lib/localize"
import type { IRoom } from "@/types"
import { DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"

import type { ReactElement } from "react"

/** Parses a URL attendee count and falls back when it is invalid. */
const peopleValue = (value: string | null, fallback: number): number => {
  const parsed = Number(value)

  return Number.isInteger(parsed) ? Math.max(1, Math.min(20, parsed)) : fallback
}

/** Hosts the primary room discovery and room-booking workflow. */
const HomePage = () => {
  const { t, i18n } = useTranslation()
  const { params, selectedDate, dateValue, filters, update, updateFilters } = useScheduleUrl()
  const navigate = useNavigate()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(() => params.get("schedule") === "open")
  const [rightOpen, setRightOpen] = useState(false)
  const allRooms = useRooms()
  const filteredRooms = useRooms(filters)
  const holidays = useHolidays()
  const employees = useEmployees()
  const detailsEdit = useEditBooking()

  const anyRoomMode = params.get("anyRoom") === "true"
  const peopleCount = peopleValue(params.get("people"), 1)

  const selectedId = params.get("room") ?? allRooms.data?.[0]?.id ?? ""
  const selectedRoom = allRooms.data?.find((room) => room.id === selectedId) ?? allRooms.data?.[0]

  const dayBookings = useRoomBookings(
    {
      roomId: selectedRoom?.id ?? "",
      status: "confirmed",
      from: fromDateAndTime(dateValue, "00:00"),
      to: fromDateAndTime(dateValue, "23:59"),
    },
    Boolean(selectedRoom) && !anyRoomMode
  )
  const allDayBookings = usePagedBookings(
    {
      status: "confirmed",
      from: fromDateAndTime(dateValue, "00:00"),
      to: fromDateAndTime(dateValue, "23:59"),
    },
    true
  )
  const calendarActivity = useBookingActivity({}, calendarOpen)
  const myCalendarActivity = useBookingActivity({ organizerId: DEFAULT_EMPLOYEE_ID }, calendarOpen)

  const searchOpen = params.get("history") === "open"
  const selectedBookingId = params.get("booking") ?? undefined
  const activeDayBookings = anyRoomMode ? (allDayBookings.data ?? []) : (dayBookings.data ?? [])
  const listedBooking = activeDayBookings.find((booking) => booking.id === selectedBookingId)

  const bookingDetail = useBooking(selectedBookingId, listedBooking)

  const selectedBooking = bookingDetail.data
  const canEditSelected = Boolean(
    selectedBooking?.organizerId === DEFAULT_EMPLOYEE_ID &&
    new Date(selectedBooking.endAt) > new Date()
  )
  const editingSelected = canEditSelected && params.get("bookingEdit") === "true"

  useEffect(() => {
    if (params.get("guide") !== "booking") return
    const step = params.get("guideStep")
    const frame = window.requestAnimationFrame(() => {
      const mobile = matchMedia("(max-width: 1023px)").matches
      setLeftOpen(
        mobile &&
          (step === "date" ||
            step === "time-selection" ||
            step === "any-room" ||
            step === "search" ||
            step === "editor")
      )
      setRightOpen(mobile && step === "filters")
    })

    return () => window.cancelAnimationFrame(frame)
  }, [params])

  useEffect(() => {
    const openFilters = () => setRightOpen(true)
    window.addEventListener("meeting-room:open-filters", openFilters)

    return () => window.removeEventListener("meeting-room:open-filters", openFilters)
  }, [])

  useEffect(() => {
    if (!allRooms.data?.[0] || allRooms.data.some((room) => room.id === params.get("room"))) return
    const requested = allRooms.data[0]
    const next = new URLSearchParams(params)
    next.set("room", requested.id)
    next.set("date", dateValue)
    void navigate({ pathname: PATHS.home, search: next.toString() }, { replace: true })
  }, [allRooms.data, dateValue, navigate, params])

  const selectRoom = useCallback(
    (room: IRoom) => {
      const next = new URLSearchParams(params)
      next.set("room", room.id)
      next.delete("booking")
      next.delete("bookingEdit")
      next.delete("anyRoom")
      next.delete("people")
      if (
        matchMedia("(max-width: 1023px)").matches &&
        params.get("guide") === "booking" &&
        params.get("guideStep") === "filters"
      ) {
        next.delete("guide")
        next.delete("guideStep")
        next.delete("returnDoc")
      }
      void navigate({ pathname: PATHS.home, search: next.toString() })
      setRightOpen(false)
    },
    [navigate, params]
  )

  const handleLeftOpenChange = (open: boolean) => {
    setLeftOpen(open)
    if (
      open ||
      !matchMedia("(max-width: 1023px)").matches ||
      params.get("guide") !== "booking" ||
      !["date", "time-selection", "any-room", "search", "editor"].includes(
        params.get("guideStep") ?? ""
      )
    )
      return
    update({ guide: undefined, guideStep: undefined, returnDoc: undefined })
  }

  const handleRightOpenChange = (open: boolean) => {
    setRightOpen(open)
    if (
      !open &&
      matchMedia("(max-width: 1023px)").matches &&
      params.get("guide") === "booking" &&
      params.get("guideStep") === "filters"
    )
      update({ guide: undefined, guideStep: undefined, returnDoc: undefined })
  }

  const schedule =
    selectedRoom || anyRoomMode ? (
      <ScheduleSidebar
        room={anyRoomMode ? undefined : selectedRoom}
        rooms={allRooms.data ?? []}
        anyRoomMode={anyRoomMode}
        peopleCount={peopleCount}
        selectedDate={selectedDate}
        bookings={activeDayBookings}
        holidays={holidays.data ?? []}
        onDate={(date) => update({ date: dateKey(date), booking: undefined })}
        onOpenCalendar={() => setCalendarOpen(true)}
        onOpenSearch={() => update({ history: "open" })}
        selectedBookingId={selectedBookingId}
        onBooking={(booking) => update({ booking: booking.id, bookingEdit: undefined })}
        onClearBooking={() => update({ booking: undefined })}
        onEditBooking={(booking) => update({ booking: booking.id, bookingEdit: "true" })}
        onPeopleCount={(count) => update({ people: count === 1 ? undefined : String(count) })}
        onToggleAnyRoom={() =>
          update({
            anyRoom: anyRoomMode ? undefined : "true",
            people: undefined,
            booking: undefined,
            bookingEdit: undefined,
            ...(anyRoomMode &&
            params.get("guide") === "booking" &&
            params.get("guideStep") === "any-room"
              ? { guideStep: "room" }
              : {}),
          })
        }
        onAnyRoomBooked={(booking) => {
          const next = new URLSearchParams(params)
          next.set("date", appDateKey(booking.startAt))
          next.set("booking", booking.id)
          next.set("room", booking.roomId)
          next.delete("anyRoom")
          next.delete("people")
          next.delete("bookingEdit")
          void navigate({ pathname: PATHS.home, search: next.toString() })
        }}
        loading={anyRoomMode ? allDayBookings.isFetching : dayBookings.isPending}
      />
    ) : null
  const rooms = (
    <RoomsSidebar
      rooms={[...(filteredRooms.data ?? [])].sort(
        (first, second) => first.capacity - second.capacity
      )}
      loading={filteredRooms.isLoading}
      filters={filters}
      selectedId={anyRoomMode ? undefined : selectedRoom?.id}
      onFilters={updateFilters}
      onSelect={selectRoom}
    />
  )
  let roomContent: ReactElement
  if (anyRoomMode) {
    roomContent = (
      <div className="flex h-full flex-col items-center justify-center gap-3 border bg-muted/20 p-8 text-center">
        <Sparkles className="size-8 text-primary" />
        <div>
          <h2 className="font-semibold">{t("bookAnyRoom")}</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{t("anyRoomBookingHint")}</p>
        </div>
      </div>
    )
  } else if (selectedRoom) {
    roomContent = <RoomCard room={selectedRoom} />
  } else if (allRooms.isPending) {
    roomContent = (
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border bg-panel shadow-sm">
        <Skeleton className="size-full min-h-0" />
        <div className="border-t p-6 sm:p-8">
          <div className="mb-4 flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="h-4 w-3/4" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    )
  } else if (allRooms.isError) {
    roomContent = (
      <ApiErrorAlert
        error={allRooms.error}
        fallback={t("loadError")}
      />
    )
  } else {
    roomContent = <p>{t("noRooms")}</p>
  }

  let scheduleDescription = ""
  if (anyRoomMode) scheduleDescription = t("bookAnyRoom")
  else if (selectedRoom) scheduleDescription = localize(selectedRoom.name, i18n.language)

  return (
    <main className="h-[calc(100dvh-4rem)] w-full overflow-hidden p-2">
      <ResizableScheduleLayout
        schedule={schedule}
        room={roomContent}
        rooms={rooms}
      />
      <section className="relative h-full min-h-0 min-w-0 overflow-hidden lg:hidden">
        <div className="absolute left-3 top-3 z-30 flex gap-2">
          <Button
            className="shadow-lg ring-2 ring-background/80"
            onClick={() => setLeftOpen(true)}
          >
            <Clock3 />
            {t("schedule")}
          </Button>
          <Button
            className="shadow-lg ring-2 ring-background/80"
            onClick={() => setRightOpen(true)}
          >
            <SlidersHorizontal />
            {t("rooms")}
          </Button>
        </div>
        {roomContent}
      </section>
      <Drawer
        open={leftOpen}
        onOpenChange={handleLeftOpenChange}
        swipeDirection="left"
      >
        <DrawerContent className="h-dvh">
          <DrawerHeader>
            <DrawerTitle>{t("schedule")}</DrawerTitle>
            <DrawerDescription>{scheduleDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1">{schedule}</div>
        </DrawerContent>
      </Drawer>
      <Drawer
        open={rightOpen}
        onOpenChange={handleRightOpenChange}
        swipeDirection="right"
      >
        <DrawerContent className="h-dvh">
          <DrawerHeader>
            <DrawerTitle>{t("rooms")}</DrawerTitle>
            <DrawerDescription>{t("showFilters")}</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1">{rooms}</div>
        </DrawerContent>
      </Drawer>
      <ScheduleCalendarDialog
        open={calendarOpen}
        selected={selectedDate}
        activity={calendarActivity.data ?? []}
        myActivity={myCalendarActivity.data ?? []}
        holidays={holidays.data ?? []}
        onOpenChange={setCalendarOpen}
        onSelect={(date) => update({ date: dateKey(date), booking: undefined })}
      />
      <BookingSearchDialog
        open={searchOpen}
        onOpenChange={(open) => update({ history: open ? "open" : undefined })}
      />
      <BookingDetailsDialog
        key={selectedBookingId}
        booking={selectedBooking}
        room={selectedRoom}
        employee={employees.data?.find((employee) => employee.id === selectedBooking?.organizerId)}
        attendees={employees.data?.filter((employee) =>
          selectedBooking?.attendeeIds.includes(employee.id)
        )}
        loading={bookingDetail.isPending}
        open={Boolean(selectedBookingId) && !editingSelected}
        returnHref={params.get("returnTo") ?? undefined}
        onEdit={canEditSelected ? () => update({ bookingEdit: "true" }) : undefined}
        onOpenChange={(open) => !open && update({ booking: undefined, bookingEdit: undefined })}
      />
      <EditableBookingDialog
        booking={selectedBooking}
        rooms={allRooms.data ?? []}
        bookings={allDayBookings.data ?? []}
        employees={employees.data ?? []}
        holidays={holidays.data ?? []}
        open={Boolean(editingSelected)}
        pending={detailsEdit.isPending}
        errorMessage={
          detailsEdit.error ? getApiErrorMessage(detailsEdit.error, t("bookingFailed")) : undefined
        }
        onSave={async (changes) => {
          if (!selectedBooking) return
          const updated = await detailsEdit.mutateAsync({ bookingId: selectedBooking.id, changes })
          const next = new URLSearchParams(params)
          next.set("date", appDateKey(updated.startAt))
          next.set("booking", updated.id)
          next.set("room", updated.roomId)
          next.delete("bookingEdit")
          void navigate({ pathname: PATHS.home, search: next.toString() })
        }}
        onOpenChange={(open) => !open && update({ booking: undefined, bookingEdit: undefined })}
      />
    </main>
  )
}

export default HomePage
