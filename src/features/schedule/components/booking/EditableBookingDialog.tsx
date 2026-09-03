import { zodResolver } from "@hookform/resolvers/zod"
import { addMonths, differenceInMinutes, isWeekend, subMinutes } from "date-fns"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  BOOKING_HORIZON_MONTHS,
  BOOKING_PAST_GRACE_MINUTES,
  BOOKING_SLOT_MINUTES,
  MAX_BOOKING_DURATION_MINUTES,
  MIN_BOOKING_DURATION_MINUTES,
  TIME_VALUE_PATTERN,
  WORKING_HOURS,
} from "@/constants"
import { ModalGuideQuestionButton } from "@/features/guide"
import { appDateKey, formatAppTime, fromDateAndTime, nativeDateLocale } from "@/lib/date"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type {
  IBooking,
  IEmployee,
  IHoliday,
  IRoom,
  IRoomFilters,
  IUpdateBookingInput,
} from "@/types"

import {
  capacityMatches,
  clamp,
  editBookingFormSchema,
  timeMinutes,
  timeValue,
  toBookingSlot,
  type TEditBookingForm,
} from "../../utils"

import { ChangeBookingRoomDrawer } from "./ChangeBookingRoomDrawer"
import { EditableBookingGuides } from "./EditableBookingGuides"
import { UnsavedBookingChangesDialog } from "./UnsavedBookingChangesDialog"

interface IProps {
  booking?: IBooking
  rooms: IRoom[]
  bookings: IBooking[]
  employees: IEmployee[]
  holidays: IHoliday[]
  open: boolean
  pending: boolean
  errorMessage?: string
  onSave: (changes: IUpdateBookingInput) => Promise<void>
  onOpenChange: (open: boolean) => void
}

/** Provides the validated form used to update an existing booking. */
export const EditableBookingDialog = ({
  booking,
  rooms,
  bookings,
  employees,
  holidays,
  open,
  pending,
  errorMessage,
  onSave,
  onOpenChange,
}: IProps) => {
  const { t, i18n } = useTranslation()
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [showEditGuideOpener, setShowEditGuideOpener] = useState(false)
  const [showRoomGuideOpener, setShowRoomGuideOpener] = useState(false)
  const [filters, setFilters] = useState<IRoomFilters>({})
  const form = useForm<TEditBookingForm>({
    resolver: zodResolver(editBookingFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      date: "",
      start: "",
      end: "",
      roomId: "",
      attendeeIds: [],
    },
  })
  const roomId = useWatch({ control: form.control, name: "roomId" })
  const selectedDate = useWatch({ control: form.control, name: "date" })
  const selectedStartValue = useWatch({ control: form.control, name: "start" })
  const selectedEndValue = useWatch({ control: form.control, name: "end" })
  const attendeeIds = useWatch({ control: form.control, name: "attendeeIds" })

  const selectedRoom = rooms.find((room) => room.id === roomId)
  const workingStart = WORKING_HOURS.start * 60
  const workingEnd = WORKING_HOURS.end * 60
  const initialDuration = booking
    ? clamp(
        differenceInMinutes(new Date(booking.endAt), new Date(booking.startAt)),
        MIN_BOOKING_DURATION_MINUTES,
        MAX_BOOKING_DURATION_MINUTES
      )
    : MIN_BOOKING_DURATION_MINUTES
  const selectedStart = TIME_VALUE_PATTERN.test(selectedStartValue)
    ? timeMinutes(selectedStartValue)
    : workingStart
  const maximumAttendeeCount = Math.max(0, ...rooms.map((room) => room.capacity - 1))
  const attendeeSelectionLimit =
    selectedRoom && selectedRoom.capacity > 1 ? selectedRoom.capacity - 1 : maximumAttendeeCount
  const normalizedSearch = filters.search?.trim().toLocaleLowerCase()
  const filteredRooms = rooms.filter(
    (room) =>
      (!normalizedSearch ||
        `${room.name.en} ${room.name.ka} ${room.description.en} ${room.description.ka}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)) &&
      capacityMatches(room.capacity, filters.capacity) &&
      (!filters.amenities?.length ||
        filters.amenities.every((amenity) => room.amenities.includes(amenity))) &&
      (!filters.hasAirConditioning || room.airConditionerCount > 0) &&
      (!filters.isAccessible || room.isAccessible)
  )
  const selectedStartAt =
    selectedDate && TIME_VALUE_PATTERN.test(selectedStartValue)
      ? fromDateAndTime(selectedDate, selectedStartValue)
      : undefined
  const selectedEndAt =
    selectedDate && TIME_VALUE_PATTERN.test(selectedEndValue)
      ? fromDateAndTime(selectedDate, selectedEndValue)
      : undefined
  const unavailableRoomIds = new Set(
    selectedStartAt && selectedEndAt
      ? bookings
          .filter(
            (item) =>
              item.id !== booking?.id &&
              item.status === "confirmed" &&
              selectedStartAt < item.endAt &&
              selectedEndAt > item.startAt
          )
          .map((item) => item.roomId)
      : []
  )

  useEffect(() => {
    if (!booking || !open) return
    form.reset({
      title: localize(booking.title, i18n.language),
      notes: localize(booking.notes, i18n.language),
      date: appDateKey(booking.startAt),
      start: formatAppTime(booking.startAt, "en"),
      end: formatAppTime(booking.endAt, "en"),
      roomId: booking.roomId,
      attendeeIds: booking.attendeeIds,
    })
  }, [booking, form, i18n.language, open])

  /** Validates booking policy and availability before saving edited form values. */
  const submit = async (values: TEditBookingForm) => {
    if (!booking) return
    const startAt = fromDateAndTime(values.date, values.start)
    const endAt = fromDateAndTime(values.date, values.end)
    const start = new Date(startAt)
    const invalidDate =
      start < subMinutes(new Date(), BOOKING_PAST_GRACE_MINUTES) ||
      start > addMonths(new Date(), BOOKING_HORIZON_MONTHS) ||
      (!ALLOW_WEEKEND_BOOKINGS && isWeekend(new Date(`${values.date}T12:00:00`))) ||
      (!ALLOW_HOLIDAY_BOOKINGS && holidays.some((holiday) => holiday.date === values.date))
    if (invalidDate) {
      form.setError("date", { message: t("dateUnavailable") })

      return
    }
    const overlaps = bookings.some(
      (item) =>
        item.id !== booking.id &&
        item.status === "confirmed" &&
        item.roomId === values.roomId &&
        startAt < item.endAt &&
        endAt > item.startAt
    )
    if (overlaps) {
      form.setError("start", { message: t("timeUnavailable") })

      return
    }
    await onSave({
      roomId: values.roomId,
      title: values.title,
      notes: values.notes,
      attendeeIds: selectedRoom?.capacity === 1 ? [] : values.attendeeIds,
      startAt,
      endAt,
    })
    form.reset(values)
    setConfirmClose(false)
  }

  /** Requests confirmation when closing a form that contains unsaved changes. */
  const requestClose = () => (form.formState.isDirty ? setConfirmClose(true) : onOpenChange(false))

  const handleDialogOpenChange = (next: boolean) => {
    if (showEditGuideOpener || next) return

    setRoomDrawerOpen(false)
    requestClose()
  }

  return (
    <>
      <Dialog
        open={open && !showEditGuideOpener}
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden gap-0 sm:max-w-xl">
          <ModalGuideQuestionButton guideId="edit-booking" />
          <DialogHeader>
            <DialogTitle>{t("editBooking")}</DialogTitle>
            <DialogDescription>{t("editBookingHint")}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4">
            {booking && (
              <form
                data-modal-guide="edit-form"
                className="space-y-4"
                onSubmit={form.handleSubmit(submit)}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="details-title">{t("bookingTitle")}</Label>
                  <Input
                    id="details-title"
                    {...form.register("title")}
                    aria-invalid={Boolean(form.formState.errors.title)}
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-destructive">{t("required")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="details-notes">{t("notes")}</Label>
                  <Textarea
                    id="details-notes"
                    rows={4}
                    {...form.register("notes")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="details-date">{t("date")}</Label>
                  <Input
                    id="details-date"
                    type="date"
                    lang={nativeDateLocale(i18n.language)}
                    min={appDateKey(subMinutes(new Date(), BOOKING_PAST_GRACE_MINUTES))}
                    max={appDateKey(addMonths(new Date(), BOOKING_HORIZON_MONTHS))}
                    {...form.register("date", { onChange: () => form.clearErrors("date") })}
                    aria-invalid={Boolean(form.formState.errors.date)}
                  />
                  {form.formState.errors.date && (
                    <p className="mt-1 text-xs text-destructive">
                      {form.formState.errors.date.message}
                    </p>
                  )}
                  {selectedDate &&
                    ((!ALLOW_WEEKEND_BOOKINGS && isWeekend(new Date(`${selectedDate}T12:00:00`))) ||
                      (!ALLOW_HOLIDAY_BOOKINGS &&
                        holidays.some((holiday) => holiday.date === selectedDate))) && (
                      <p className="mt-1 text-xs text-destructive">{t("dateUnavailable")}</p>
                    )}
                </div>
                <div
                  data-modal-guide="edit-time"
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="details-start">{t("startTime")}</Label>
                    <Input
                      id="details-start"
                      type="time"
                      min={timeValue(workingStart)}
                      max={timeValue(workingEnd - initialDuration)}
                      step={BOOKING_SLOT_MINUTES * 60}
                      {...form.register("start", {
                        onChange: (event) => {
                          const value = String(event.target.value)
                          if (TIME_VALUE_PATTERN.test(value)) {
                            const nextStart = clamp(
                              toBookingSlot(timeMinutes(value)),
                              workingStart,
                              workingEnd - initialDuration
                            )
                            form.setValue("start", timeValue(nextStart), {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                            form.setValue("end", timeValue(nextStart + initialDuration), {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          form.clearErrors("start")
                          form.clearErrors("end")
                        },
                      })}
                      aria-invalid={Boolean(form.formState.errors.start)}
                    />
                    {form.formState.errors.start && (
                      <p className="mt-1 text-xs text-destructive">
                        {t(form.formState.errors.start.message ?? "invalidDuration")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="details-end">{t("endTime")}</Label>
                    <Input
                      id="details-end"
                      type="time"
                      min={timeValue(selectedStart + MIN_BOOKING_DURATION_MINUTES)}
                      max={timeValue(
                        Math.min(selectedStart + MAX_BOOKING_DURATION_MINUTES, workingEnd)
                      )}
                      step={BOOKING_SLOT_MINUTES * 60}
                      {...form.register("end", {
                        onChange: (event) => {
                          const value = String(event.target.value)
                          if (TIME_VALUE_PATTERN.test(value)) {
                            const currentStart = TIME_VALUE_PATTERN.test(form.getValues("start"))
                              ? timeMinutes(form.getValues("start"))
                              : workingStart
                            const nextEnd = clamp(
                              toBookingSlot(timeMinutes(value)),
                              currentStart + MIN_BOOKING_DURATION_MINUTES,
                              Math.min(currentStart + MAX_BOOKING_DURATION_MINUTES, workingEnd)
                            )
                            form.setValue("end", timeValue(nextEnd), {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          form.clearErrors("start")
                          form.clearErrors("end")
                        },
                      })}
                      aria-invalid={Boolean(form.formState.errors.end)}
                    />
                    {form.formState.errors.end && (
                      <p className="mt-1 text-xs text-destructive">
                        {t(form.formState.errors.end.message ?? "invalidDuration")}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  data-modal-guide="edit-room"
                  className="border p-3"
                >
                  <span className="text-xs text-muted-foreground">{t("selectedRoom")}</span>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <strong>
                      {selectedRoom ? localize(selectedRoom.name, i18n.language) : t("noRooms")}
                    </strong>
                    <Button
                      data-modal-opener="change-room"
                      type="button"
                      variant="outline"
                      onClick={() => setRoomDrawerOpen(true)}
                    >
                      {t("changeRoom")}
                    </Button>
                  </div>
                </div>
                {maximumAttendeeCount > 0 && (
                  <fieldset className="border p-3">
                    <legend className="px-1 text-xs font-medium text-muted-foreground">
                      {t("attendeesOptional")}
                    </legend>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {t("attendeeLimit", { count: attendeeSelectionLimit })}
                    </p>
                    <div className="grid max-h-44 gap-2 overflow-y-auto pr-2 scrollbar-gutter-stable sm:grid-cols-2">
                      {employees
                        .filter((employee) => employee.id !== booking.organizerId)
                        .map((employee) => {
                          const selected = attendeeIds.includes(employee.id)
                          const atCapacity = attendeeIds.length >= attendeeSelectionLimit

                          return (
                            <label
                              key={employee.id}
                              aria-disabled={!selected && atCapacity}
                              className={cn(
                                "flex cursor-pointer items-start gap-2 border p-2 text-sm outline outline-0 outline-primary/40 transition-colors",
                                selected &&
                                  "border-primary bg-primary/10 outline-2 -outline-offset-2",
                                !selected && atCapacity
                                  ? "cursor-not-allowed opacity-40"
                                  : "hover:border-primary/70 hover:bg-accent/70"
                              )}
                            >
                              <Checkbox
                                checked={selected}
                                disabled={!selected && atCapacity}
                                onCheckedChange={(checked) =>
                                  form.setValue(
                                    "attendeeIds",
                                    checked
                                      ? [...attendeeIds, employee.id]
                                      : attendeeIds.filter((id) => id !== employee.id),
                                    { shouldDirty: true }
                                  )
                                }
                              />
                              <span className="min-w-0">
                                <strong className="block truncate">
                                  {localize(employee.name, i18n.language)}
                                </strong>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {employee.email}
                                </span>
                              </span>
                            </label>
                          )
                        })}
                    </div>
                  </fieldset>
                )}
                {errorMessage && (
                  <p
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errorMessage}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={pending || !form.formState.isDirty}
                >
                  {pending ? t("savingChanges") : t("saveChanges")}
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ChangeBookingRoomDrawer
        open={roomDrawerOpen}
        guideOpenerVisible={showRoomGuideOpener}
        rooms={filteredRooms}
        filters={filters}
        roomId={roomId}
        unavailableRoomIds={unavailableRoomIds}
        selectedRoom={selectedRoom}
        form={form}
        onFilters={setFilters}
        onOpenChange={setRoomDrawerOpen}
      />
      <UnsavedBookingChangesDialog
        open={confirmClose}
        pending={pending}
        onOpenChange={setConfirmClose}
        onDiscard={() => {
          setConfirmClose(false)
          form.reset()
          onOpenChange(false)
        }}
        onSave={() => void form.handleSubmit(submit)()}
      />
      <EditableBookingGuides
        onShowEditOpener={setShowEditGuideOpener}
        onShowRoomOpener={setShowRoomGuideOpener}
      />
    </>
  )
}
