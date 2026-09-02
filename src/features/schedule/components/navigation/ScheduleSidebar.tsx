import { zodResolver } from "@hookform/resolvers/zod"
import { addDays, addMonths, isWeekend, subMinutes } from "date-fns"
import { ArrowLeft, CalendarDays, Search, Sparkles } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getApiErrorMessage } from "@/api/api"
import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  BOOKING_HORIZON_MONTHS,
  BOOKING_PAST_GRACE_MINUTES,
  BOOKING_SLOT_MINUTES,
  WORKING_HOURS,
  TIME_VALUE_PATTERN,
} from "@/constants"
import {
  useCreateBooking,
  useDeleteBooking,
  useEditBooking,
  useEmployees,
  useTimelineNow,
} from "@/hooks"
import { appCalendarDate, appClockMinutes, appDateKey, dateKey, fromDateAndTime } from "@/lib/date"
import { localize } from "@/lib/localize"
import type { IBooking, IHoliday, IRoom } from "@/types"

import { bookingFormSchema, type TBookingForm } from "../../utils"
import { BookingEditor, PeopleCountSlider } from "../editor"
import { BookingTimeline, type ITimelineRange } from "../timeline"

import { WeekPicker } from "./WeekPicker"

interface IProps {
  room?: IRoom
  rooms: IRoom[]
  anyRoomMode: boolean
  peopleCount: number
  selectedDate: Date
  bookings: IBooking[]
  holidays: IHoliday[]
  onDate: (date: Date) => void
  onOpenCalendar: () => void
  onOpenSearch: () => void
  selectedBookingId?: string
  onBooking: (booking: IBooking) => void
  onClearBooking: () => void
  onEditBooking: (booking: IBooking) => void
  onPeopleCount: (count: number) => void
  onToggleAnyRoom: () => void
  onAnyRoomBooked: (booking: IBooking) => void
  loading?: boolean
}

/** Combines overlapping unavailable timeline ranges for display and validation. */
const mergeRanges = (ranges: ITimelineRange[]): ITimelineRange[] =>
  ranges.reduce<ITimelineRange[]>((merged, range) => {
    const previous = merged.at(-1)
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end)

      return merged
    }

    return [...merged, { ...range }]
  }, [])

/** Coordinates date selection, timeline booking, and room navigation controls. */
export const ScheduleSidebar = ({
  room,
  rooms,
  anyRoomMode,
  peopleCount,
  selectedDate,
  bookings,
  holidays,
  onDate,
  onOpenCalendar,
  onOpenSearch,
  selectedBookingId,
  onBooking,
  onClearBooking,
  onEditBooking,
  onPeopleCount,
  onToggleAnyRoom,
  onAnyRoomBooked,
  loading,
}: IProps) => {
  const { t, i18n } = useTranslation()
  const create = useCreateBooking()
  const edit = useEditBooking()
  const rescheduleQueues = useRef(new Map<string, Promise<void>>())
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const remove = useDeleteBooking()
  const employees = useEmployees()
  const now = useTimelineNow()
  const [bookingToDelete, setBookingToDelete] = useState<IBooking>()
  const form = useForm<TBookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { title: "", start: "09:00", end: "09:15", notes: "" },
  })
  const [start, end] = useWatch({ control: form.control, name: ["start", "end"] })

  const selectedKey = dateKey(selectedDate)

  const previousSelectedKey = useRef(selectedKey)

  useLayoutEffect(() => {
    if (previousSelectedKey.current === selectedKey) return

    previousSelectedKey.current = selectedKey
    form.setValue("start", "")
    form.setValue("end", "")
  }, [form, selectedKey])

  const holiday = holidays.find((item) => item.date === selectedKey)
  const hasSelectedRange = TIME_VALUE_PATTERN.test(start) && TIME_VALUE_PATTERN.test(end)
  const selectedStart = hasSelectedRange ? new Date(fromDateAndTime(selectedKey, start)) : undefined
  const outsideWindow =
    selectedStart !== undefined &&
    (selectedStart < subMinutes(now, BOOKING_PAST_GRACE_MINUTES) ||
      selectedStart > addMonths(now, BOOKING_HORIZON_MONTHS))
  const todayKey = appDateKey(now)
  const pastDate = selectedKey < todayKey
  const futureDate = selectedKey > appDateKey(addMonths(now, BOOKING_HORIZON_MONTHS))
  const weekend = !ALLOW_WEEKEND_BOOKINGS && isWeekend(selectedDate)
  const blockedHoliday = !ALLOW_HOLIDAY_BOOKINGS && Boolean(holiday)
  const today = appCalendarDate(now)
  const todayHoliday = holidays.some((item) => item.date === todayKey)
  const todayIsBookable =
    (ALLOW_WEEKEND_BOOKINGS || !isWeekend(today)) && (ALLOW_HOLIDAY_BOOKINGS || !todayHoliday)
  const todayBookingEnded = todayIsBookable && appClockMinutes(now) >= WORKING_HOURS.end * 60
  const nearestBookableDayIsToday = todayIsBookable && !todayBookingEnded
  const workingDayEnded =
    selectedKey === todayKey &&
    !weekend &&
    !blockedHoliday &&
    appClockMinutes(now) >= WORKING_HOURS.end * 60
  const blocked = pastDate || futureDate || weekend || blockedHoliday || workingDayEnded
  let unavailableMessage = t("futureBookingLimit", { count: BOOKING_HORIZON_MONTHS })
  if (isWeekend(selectedDate)) unavailableMessage = t("weekend")
  if (holiday) {
    const holidayGreeting = holiday.date.endsWith("01-01") ? t("happyNewYear") : t("happyHoliday")
    unavailableMessage = `${localize(holiday.name, i18n.language)}: ${holidayGreeting}`
  }
  if (workingDayEnded) unavailableMessage = t("workingDayEnded")
  if (pastDate) {
    const holidayName = holiday ? ` (${localize(holiday.name, i18n.language)})` : ""
    unavailableMessage = `${t("pastBookingUnavailable")}${holidayName}`
  }
  const startMinutes = Number(start.slice(0, 2)) * 60 + Number(start.slice(3))
  const endMinutes = Number(end.slice(0, 2)) * 60 + Number(end.slice(3))

  const eligibleRooms = useMemo(() => {
    if (anyRoomMode)
      return rooms.filter((item) => item.isActive && item.capacity >= Math.max(1, peopleCount))
    if (room) return [room]

    return []
  }, [anyRoomMode, peopleCount, room, rooms])
  const confirmedRangesByRoom = useMemo(() => {
    const ranges = new Map<string, ITimelineRange[]>()
    bookings.forEach((booking) => {
      if (booking.status !== "confirmed") return
      const roomRanges = ranges.get(booking.roomId) ?? []
      roomRanges.push({
        start: appClockMinutes(booking.startAt),
        end: appClockMinutes(booking.endAt),
      })
      ranges.set(booking.roomId, roomRanges)
    })

    return ranges
  }, [bookings])
  const availableRoomsFor = useCallback(
    (rangeStart: number, rangeEnd: number): IRoom[] =>
      eligibleRooms.filter(
        (item) =>
          !confirmedRangesByRoom
            .get(item.id)
            ?.some((range) => rangeStart < range.end && rangeEnd > range.start)
      ),
    [confirmedRangesByRoom, eligibleRooms]
  )
  const canSelectRange = useCallback(
    (rangeStart: number, rangeEnd: number): boolean =>
      availableRoomsFor(rangeStart, rangeEnd).length > 0,
    [availableRoomsFor]
  )
  const anyRoomUnavailableRanges = useMemo(
    () =>
      anyRoomMode
        ? mergeRanges(
            Array.from(
              {
                length: ((WORKING_HOURS.end - WORKING_HOURS.start) * 60) / BOOKING_SLOT_MINUTES,
              },
              (_, index): ITimelineRange => {
                const rangeStart = WORKING_HOURS.start * 60 + index * BOOKING_SLOT_MINUTES

                return { start: rangeStart, end: rangeStart + BOOKING_SLOT_MINUTES }
              }
            ).filter((range) => availableRoomsFor(range.start, range.end).length === 0)
          )
        : undefined,
    [anyRoomMode, availableRoomsFor]
  )

  const selectionAvailable =
    endMinutes > startMinutes &&
    startMinutes >= WORKING_HOURS.start * 60 &&
    endMinutes <= WORKING_HOURS.end * 60 &&
    availableRoomsFor(startMinutes, endMinutes).length > 0

  useEffect(() => {
    if (loading || blocked || selectionAvailable || (!start && !end)) return
    form.setValue("start", "")
    form.setValue("end", "")
  }, [blocked, end, form, loading, selectionAvailable, start])

  const submit = async (values: TBookingForm) => {
    const valueStart = Number(values.start.slice(0, 2)) * 60 + Number(values.start.slice(3))
    const valueEnd = Number(values.end.slice(0, 2)) * 60 + Number(values.end.slice(3))

    const targetRoom = anyRoomMode
      ? availableRoomsFor(valueStart, valueEnd).sort((first, second) => {
          const bookedMinutes = (candidate: IRoom) =>
            bookings
              .filter((booking) => booking.roomId === candidate.id)
              .reduce(
                (total, booking) =>
                  total + appClockMinutes(booking.endAt) - appClockMinutes(booking.startAt),
                0
              )

          return (
            bookedMinutes(first) - bookedMinutes(second) ||
            first.capacity - second.capacity ||
            first.id.localeCompare(second.id)
          )
        })[0]
      : room
    if (!targetRoom) return
    const changes = {
      roomId: targetRoom.id,
      title: values.title,
      startAt: fromDateAndTime(selectedKey, values.start),
      endAt: fromDateAndTime(selectedKey, values.end),
      attendeeIds: [],
      notes: values.notes || undefined,
    }
    try {
      const request = create.mutateAsync(changes)
      toast.promise(request, {
        loading: t("creating"),
        success: t("bookingCreated"),
        error: (error) => getApiErrorMessage(error, t("bookingFailed")),
      })
      const created = await request
      form.reset({ title: "", start: values.start, end: values.end, notes: "" })
      if (anyRoomMode) onAnyRoomBooked(created)
    } catch {
      /* Mutation state renders the API error. */
    }
  }
  const rescheduleBooking = (
    booking: IBooking,
    nextStart: string,
    nextEnd: string
  ): Promise<void> => {
    const previous = rescheduleQueues.current.get(booking.id) ?? Promise.resolve()
    const request = previous
      .catch(() => undefined)
      .then(() =>
        edit
          .mutateAsync({
            bookingId: booking.id,
            changes: {
              startAt: fromDateAndTime(selectedKey, nextStart),
              endAt: fromDateAndTime(selectedKey, nextEnd),
            },
          })
          .then(() => undefined)
      )
    rescheduleQueues.current.set(booking.id, request)
    void request.finally(() => {
      if (rescheduleQueues.current.get(booking.id) === request)
        rescheduleQueues.current.delete(booking.id)
    })
    toast.promise(request, {
      loading: t("savingChanges"),
      success: t("bookingUpdated"),
      error: (error) => getApiErrorMessage(error, t("bookingFailed")),
    })

    return request
  }
  const confirmDelete = async (): Promise<void> => {
    if (!bookingToDelete) return
    await remove.mutateAsync(bookingToDelete.id)
    setBookingToDelete(undefined)
    toast.success(t("bookingCanceled"))
  }
  const goToNearestBookableDay = () => {
    let candidate = nearestBookableDayIsToday ? today : addDays(today, 1)
    while (
      (!ALLOW_WEEKEND_BOOKINGS && isWeekend(candidate)) ||
      (!ALLOW_HOLIDAY_BOOKINGS && holidays.some((item) => item.date === dateKey(candidate)))
    )
      candidate = addDays(candidate, 1)
    onDate(candidate)
  }

  return (
    <div className="schedule-sidebar flex h-full min-h-0 flex-col bg-panel">
      <div data-guide="booking-time-controls">
        <WeekPicker
          selected={selectedDate}
          onSelect={onDate}
          onOpenCalendar={onOpenCalendar}
        />
      </div>
      <div className="space-y-2 border-b p-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            data-guide="booking-search"
            data-modal-opener="booking-search"
            variant="outline"
            onClick={onOpenSearch}
          >
            <Search />
            <span className="history-label-long">{t("fullSearch")}</span>
            <span className="history-label-medium">{t("searchHistoryMedium")}</span>
            <span className="history-label-short">{t("searchHistoryShort")}</span>
          </Button>
          <Button
            data-guide="any-room"
            type="button"
            variant="outline"
            onClick={onToggleAnyRoom}
          >
            {anyRoomMode ? <ArrowLeft /> : <Sparkles />}
            <span className="any-room-label-long">
              {anyRoomMode ? t("backToRoomBooking") : t("bookAnyRoom")}
            </span>
            <span className="any-room-label-medium">
              {anyRoomMode ? t("backToRoomBookingMedium") : t("bookAnyRoomMedium")}
            </span>
            <span className="any-room-label-short">
              {anyRoomMode ? t("backToRoomBookingShort") : t("bookAnyRoomShort")}
            </span>
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">{t("selectStart")}</p>
      </div>
      {anyRoomMode && (
        <div className="space-y-3 border-b p-3">
          <PeopleCountSlider
            value={peopleCount}
            label={t("peopleCount")}
            onCommit={onPeopleCount}
          />
          <p className="text-[10px] text-muted-foreground">
            {eligibleRooms.length
              ? t("suitableRoomsAvailable", { count: eligibleRooms.length })
              : t("noSuitableRooms")}
          </p>
          <p className="text-[10px] leading-4 text-muted-foreground">
            {t("anyRoomContinuousHint")}
          </p>
        </div>
      )}
      {blocked && (
        <div className="space-y-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <p>{unavailableMessage}</p>
          {(pastDate || futureDate || workingDayEnded) && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={goToNearestBookableDay}
            >
              <CalendarDays />
              {nearestBookableDayIsToday ? t("goToToday") : t("goToNextBookableDay")}
            </Button>
          )}
        </div>
      )}
      <div
        ref={timelineScrollRef}
        data-guide="booking-timeline"
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        aria-busy={loading}
      >
        <BookingTimeline
          date={selectedKey}
          bookings={anyRoomMode ? [] : bookings}
          unavailableRanges={anyRoomUnavailableRanges}
          canSelectRange={canSelectRange}
          employees={employees.data ?? []}
          start={start}
          end={end}
          blocked={blocked}
          selectedBookingId={selectedBookingId}
          scrollContainerRef={timelineScrollRef}
          onRange={(nextStart, nextEnd) => {
            form.setValue("start", nextStart)
            form.setValue("end", nextEnd)
            form.clearErrors("end")
          }}
          onBooking={onBooking}
          onClearBooking={onClearBooking}
          onEdit={onEditBooking}
          onDelete={setBookingToDelete}
          onReschedule={rescheduleBooking}
        />
        {loading && (
          <div className="pointer-events-none absolute inset-x-14 top-2 h-1 animate-pulse bg-primary/40" />
        )}
      </div>
      <BookingEditor
        form={form}
        editing={false}
        blocked={Boolean(loading) || blocked || outsideWindow || !selectionAvailable}
        pending={create.isPending}
        errorMessage={
          create.error ? getApiErrorMessage(create.error, t("bookingFailed")) : undefined
        }
        onSubmit={submit}
        onStopEditing={() => form.reset()}
      />
      <Dialog
        open={Boolean(bookingToDelete)}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setBookingToDelete(undefined)
        }}
      >
        <DialogContent placement="center">
          <DialogHeader>
            <DialogTitle>{t("confirmCancelTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmCancelDescription", {
                title: bookingToDelete ? localize(bookingToDelete.title, i18n.language) : "",
              })}
            </DialogDescription>
          </DialogHeader>
          {remove.error && (
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {getApiErrorMessage(remove.error, t("bookingDeleteFailed"))}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setBookingToDelete(undefined)}
            >
              {t("keepBooking")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => void confirmDelete()}
            >
              {remove.isPending ? t("loading") : t("confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
