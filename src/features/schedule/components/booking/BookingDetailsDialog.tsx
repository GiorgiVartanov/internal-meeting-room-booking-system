import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import { ModalGuide, ModalGuideQuestionButton } from "@/features/guide"
import { RoomCard } from "@/features/rooms"
import { useDeleteBooking } from "@/hooks"
import { formatAppDate, formatAppTime } from "@/lib/date"
import { localize } from "@/lib/localize"
import type { IBooking, IEmployee, IRoom } from "@/types"

interface IProps {
  booking?: IBooking
  room?: IRoom
  employee?: IEmployee
  attendees?: IEmployee[]
  open: boolean
  scheduleHref?: string
  returnHref?: string
  loading?: boolean
  onEdit?: () => void
  onOpenChange: (open: boolean) => void
}

/** Shows complete booking details together with the actions allowed for that booking. */
export const BookingDetailsDialog = ({
  booking,
  room,
  employee,
  attendees = [],
  open,
  scheduleHref,
  returnHref,
  loading = false,
  onEdit,
  onOpenChange,
}: IProps) => {
  const { t, i18n } = useTranslation()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [showDetailsGuideOpener, setShowDetailsGuideOpener] = useState(false)
  const remove = useDeleteBooking()

  const canEdit = Boolean(
    booking?.organizerId === DEFAULT_EMPLOYEE_ID && new Date(booking.endAt) > new Date()
  )
  const canCancel = Boolean(
    booking?.organizerId === DEFAULT_EMPLOYEE_ID && new Date(booking.endAt) >= new Date()
  )

  /** Cancels the displayed booking and closes its details dialog after success. */
  const cancelBooking = async (): Promise<void> => {
    if (!booking) return
    try {
      await remove.mutateAsync(booking.id)
      toast.success(t("bookingCanceled"))
      onOpenChange(false)
    } catch {
      /* Mutation state renders the API error. */
    }
  }
  /** Closes the booking details flow from the cancellation confirmation. */
  const closeCancelConfirmation = () => {
    onOpenChange(false)
  }

  return (
    <>
      <Dialog
        open={open && !showDetailsGuideOpener}
        onOpenChange={(next) => {
          if (!showDetailsGuideOpener) onOpenChange(next)
        }}
      >
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden gap-0 sm:max-w-2xl">
          <ModalGuideQuestionButton guideId="booking-details" />
          <DialogHeader>
            <DialogTitle>
              {booking ? localize(booking.title, i18n.language) : t("bookingDetails")}
            </DialogTitle>
            <DialogDescription>{t("bookingDetails")}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4">
            {loading && !booking && (
              <div className="space-y-3">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            )}
            {booking && (
              <div className="space-y-4">
                {room && (
                  <div data-modal-guide="details-room">
                    <RoomCard
                      room={room}
                      compact
                      showImage
                    />
                  </div>
                )}
                <dl
                  data-modal-guide="details-information"
                  className="grid grid-cols-2 gap-3 border p-3 text-sm"
                >
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("organizer")}</dt>
                    <dd className="font-medium">
                      {employee ? localize(employee.name, i18n.language) : booking.organizerId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("date")}</dt>
                    <dd className="font-medium">
                      {formatAppDate(booking.startAt, i18n.language, { dateStyle: "full" })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("startTime")}</dt>
                    <dd className="font-medium">{formatAppTime(booking.startAt, i18n.language)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">{t("endTime")}</dt>
                    <dd className="font-medium">{formatAppTime(booking.endAt, i18n.language)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">{t("attendees")}</dt>
                    <dd className="font-medium">
                      {attendees.length
                        ? attendees
                            .map((attendee) => localize(attendee.name, i18n.language))
                            .join(", ")
                        : t("noAttendees")}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">{t("scheduledAt")}</dt>
                    <dd className="font-medium">
                      {formatAppDate(booking.createdAt, i18n.language, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">{t("notes")}</dt>
                    <dd className="whitespace-pre-wrap font-medium">
                      {localize(booking.notes, i18n.language) || t("noNotes")}
                    </dd>
                  </div>
                </dl>
                <div
                  data-modal-guide="details-actions"
                  className="flex flex-wrap gap-2"
                >
                  {canEdit && onEdit && (
                    <Button
                      data-modal-opener="edit-booking"
                      type="button"
                      onClick={onEdit}
                    >
                      {t("editBooking")}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      data-modal-opener="cancel-booking"
                      type="button"
                      variant="destructive"
                      onClick={() => setConfirmCancel(true)}
                    >
                      {t("cancelBooking")}
                    </Button>
                  )}
                  {scheduleHref && (
                    <Button render={<Link to={scheduleHref} />}>{t("goToBooking")}</Button>
                  )}
                  {returnHref && (
                    <Button render={<Link to={returnHref} />}>{t("backToPrevious")}</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={open && confirmCancel}
        onOpenChange={(next) => !next && !remove.isPending && closeCancelConfirmation()}
      >
        <DialogContent
          data-dialog-dismiss-protected
          placement="center"
        >
          <div
            data-modal-guide="cancel-confirmation"
            className="contents"
          >
            <DialogHeader>
              <DialogTitle>{t("confirmCancelTitle")}</DialogTitle>
              <DialogDescription>
                {t("confirmCancelDescription", {
                  title: booking ? localize(booking.title, i18n.language) : "",
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
                onClick={closeCancelConfirmation}
              >
                {t("keepBooking")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={remove.isPending}
                onClick={() => void cancelBooking()}
              >
                {remove.isPending ? t("loading") : t("confirmCancel")}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <ModalGuide
        id="booking-details"
        title={t("bookingDetails")}
        opener={{
          id: "open",
          title: t("bookingDetails"),
          description: t("modalGuideOpenDetailsDescription"),
          selector: "[data-booking]",
        }}
        steps={[
          {
            id: "room",
            title: t("roomDetails"),
            description: t("modalGuideRoomDescription"),
            selector: '[data-modal-guide="details-room"]',
          },
          {
            id: "information",
            title: t("bookingDetails"),
            description: t("modalGuideDetailsDescription"),
            selector: '[data-modal-guide="details-information"]',
          },
          {
            id: "actions",
            title: t("modalGuideActionsTitle"),
            description: t("modalGuideActionsDescription"),
            selector: '[data-modal-guide="details-actions"]',
          },
        ]}
        onShowOpener={setShowDetailsGuideOpener}
      />
    </>
  )
}
