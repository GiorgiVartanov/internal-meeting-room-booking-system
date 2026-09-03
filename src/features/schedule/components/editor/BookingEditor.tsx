import { useWatch, type UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { SelectedTimePanel } from "../timeline"

import type { TBookingForm } from "../../utils"

interface IProps {
  form: UseFormReturn<TBookingForm>
  editing: boolean
  blocked: boolean
  pending: boolean
  errorMessage?: string
  onSubmit: (values: TBookingForm) => Promise<void>
  onStopEditing: () => void
}

/** Collects and validates the details required to create a room booking. */
export const BookingEditor = ({
  form,
  editing,
  blocked,
  pending,
  errorMessage,
  onSubmit,
  onStopEditing,
}: IProps) => {
  const { t } = useTranslation()

  let submitLabel = t("createBooking")
  if (editing) submitLabel = t("saveBooking")
  if (pending) submitLabel = t("creating")

  const [title, start, end] = useWatch({
    control: form.control,
    name: ["title", "start", "end"],
  })

  return (
    <form
      data-guide="booking-editor"
      className="shrink-0 space-y-2 border-t bg-panel p-3"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="space-y-1">
          <Label htmlFor="meeting-booking-title">{t("bookingTitle")}</Label>
          <Input
            id="meeting-booking-title"
            autoComplete="off"
            {...form.register("title")}
            aria-invalid={Boolean(form.formState.errors.title)}
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-destructive">{t("required")}</p>
          )}
        </div>
        <SelectedTimePanel
          label={t("selectedTime")}
          start={start}
          end={end}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          className="min-h-10 resize-none"
          rows={1}
          {...form.register("notes")}
        />
      </div>
      {form.formState.errors.end && (
        <p className="text-xs text-destructive">{t("invalidDuration")}</p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="text-xs text-destructive"
        >
          {errorMessage}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1"
          disabled={blocked || pending || !title.trim()}
        >
          {submitLabel}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="outline"
            onClick={onStopEditing}
          >
            {t("stopEditing")}
          </Button>
        )}
      </div>
    </form>
  )
}
