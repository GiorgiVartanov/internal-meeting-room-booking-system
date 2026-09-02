import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/api/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import { useDeleteBooking } from "@/hooks"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBooking } from "@/types"

import type { MouseEvent, ReactElement } from "react"

interface IProps {
  booking: IBooking
  editHref?: string
  onEdit?: () => void
  onDelete?: () => void
}

/** Renders the edit and cancellation controls available for a booking card. */
export const BookingCardActions = ({
  booking,
  editHref,
  onEdit,
  onDelete,
}: IProps): ReactElement | null => {
  const { t, i18n } = useTranslation()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const remove = useDeleteBooking()

  const own = booking.organizerId === DEFAULT_EMPLOYEE_ID
  const canEdit = own && new Date(booking.endAt) > new Date()
  const canCancel = own && new Date(booking.endAt) >= new Date()
  if (!canEdit && !canCancel) return null

  /** Cancels the booking and closes the confirmation after a successful request. */
  const cancel = async (): Promise<void> => {
    try {
      await remove.mutateAsync(booking.id)
      toast.success(t("bookingCanceled"))
      setConfirmCancel(false)
    } catch {
      /* Mutation state renders the API error. */
    }
  }

  /** Keeps an action from activating the booking card beneath it. */
  const stopPropagation = (event: MouseEvent<HTMLElement>): void => {
    event.stopPropagation()
  }

  /** Opens the supplied edit flow without activating the booking card. */
  const edit = (event: MouseEvent<HTMLButtonElement>): void => {
    stopPropagation(event)
    onEdit?.()
  }

  /** Opens the cancellation confirmation or delegates cancellation to the caller. */
  const requestCancel = (event: MouseEvent<HTMLButtonElement>): void => {
    stopPropagation(event)

    if (onDelete) {
      onDelete()

      return
    }

    setConfirmCancel(true)
  }

  /** Closes the cancellation confirmation dialog. */
  const closeConfirmation = (): void => {
    setConfirmCancel(false)
  }

  /** Runs the asynchronous cancellation request from the confirmation control. */
  const confirmCancellation = (): void => {
    void cancel()
  }

  return (
    <>
      <div className="absolute right-0 top-0 z-30 flex gap-0">
        {canEdit && onEdit && (
          <Button
            data-modal-opener="edit-booking"
            type="button"
            size="icon-xs"
            variant="ghost"
            className={cn(
              "size-4 p-0 transition-colors duration-200 hover:bg-transparent hover:text-primary"
            )}
            aria-label={t("editBooking")}
            onClick={edit}
          >
            <Pencil />
          </Button>
        )}
        {canEdit && !onEdit && editHref && (
          <Button
            data-modal-opener="edit-booking"
            size="icon-xs"
            variant="ghost"
            className={cn(
              "size-4 p-0 transition-colors duration-200 hover:bg-transparent hover:text-primary"
            )}
            aria-label={t("editBooking")}
            onClick={stopPropagation}
            render={<Link to={editHref} />}
          >
            <Pencil />
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className={cn(
              "size-4 p-0 transition-colors duration-200 hover:bg-transparent hover:text-destructive"
            )}
            aria-label={t("cancelBooking")}
            onClick={requestCancel}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      <Dialog
        open={confirmCancel}
        onOpenChange={(next) => !remove.isPending && setConfirmCancel(next)}
      >
        <DialogContent
          placement="center"
          onClick={stopPropagation}
        >
          <DialogHeader>
            <DialogTitle>{t("confirmCancelTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmCancelDescription", {
                title: localize(booking.title, i18n.language),
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
              onClick={closeConfirmation}
            >
              {t("keepBooking")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={remove.isPending}
              onClick={confirmCancellation}
            >
              {remove.isPending ? t("loading") : t("confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
