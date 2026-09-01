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

import type { ReactElement } from "react"

interface IProps {
  booking: IBooking
  editHref?: string
  onEdit?: () => void
  compact?: boolean
}

/** Renders the edit and cancellation controls available for a booking card. */
export const BookingCardActions = ({
  booking,
  editHref,
  onEdit,
  compact = false,
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

  return (
    <>
      <span
        className={cn("absolute right-1 top-1 z-30 flex", compact && "top-0")}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {canEdit && onEdit && (
          <Button
            data-modal-opener="edit-booking"
            type="button"
            size="icon-xs"
            variant="ghost"
            className={cn(
              "transition-colors duration-200 hover:bg-transparent hover:text-primary",
              compact && "size-4"
            )}
            aria-label={t("editBooking")}
            onClick={onEdit}
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
              "transition-colors duration-200 hover:bg-transparent hover:text-primary",
              compact && "size-4"
            )}
            aria-label={t("editBooking")}
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
              "transition-colors duration-200 hover:bg-transparent hover:text-destructive",
              compact && "size-4"
            )}
            aria-label={t("cancelBooking")}
            onClick={() => setConfirmCancel(true)}
          >
            <Trash2 />
          </Button>
        )}
      </span>
      <span
        className="contents"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Dialog
          open={confirmCancel}
          onOpenChange={(next) => !remove.isPending && setConfirmCancel(next)}
        >
          <DialogContent placement="center">
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
                onClick={() => setConfirmCancel(false)}
              >
                {t("keepBooking")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={remove.isPending}
                onClick={() => void cancel()}
              >
                {remove.isPending ? t("loading") : t("confirmCancel")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </span>
    </>
  )
}
