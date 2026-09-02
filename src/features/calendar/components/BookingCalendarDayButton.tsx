import { format } from "date-fns"
import { useTranslation } from "react-i18next"

import { CalendarDayButton } from "@/components/ui/calendar"
import { dateKey, dateLocale } from "@/lib/date"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBookingDayActivity } from "@/types"

import { useBookingCalendarContext } from "../hooks"

import type { ComponentProps, ReactElement } from "react"

interface IProps extends ComponentProps<typeof CalendarDayButton> {
  day: ComponentProps<typeof CalendarDayButton>["day"]
}

/** Selects the calendar-day style for disabled, selected, and current dates. */
const stateClassName = (modifiers: IProps["modifiers"]): string | undefined => {
  if (modifiers.selected)
    return "bg-primary text-primary-foreground hover:bg-primary/65 hover:text-primary-foreground dark:hover:bg-primary/65 dark:hover:text-primary-foreground"
  if (modifiers.holiday)
    return "bg-destructive/8 text-destructive opacity-70 hover:bg-destructive/15 dark:bg-destructive/15 dark:hover:bg-destructive/25"
  if (modifiers.weekend) return "bg-muted/70 text-muted-foreground"

  return undefined
}

/** Maps daily booking availability to its visual activity style. */
const activityClassName = (activity: IBookingDayActivity["availability"]): string => {
  if (activity === "empty") return "bg-white"
  if (activity === "low") return "bg-emerald-500"
  if (activity === "medium") return "bg-orange-400"
  if (activity === "high") return "bg-red-600"

  return "bg-black"
}

/** Displays one calendar day with booking density and availability indicators. */
export const BookingCalendarDayButton = ({
  day,
  modifiers,
  ...buttonProps
}: IProps): ReactElement => {
  const { t, i18n } = useTranslation()
  const { availability, holidaysByDate } = useBookingCalendarContext()

  const activity = availability[dateKey(day.date)] ?? "empty"
  const holiday = holidaysByDate[dateKey(day.date)]
  const showActivity = !modifiers.disabled && !modifiers.holiday && !modifiers.weekend
  const dayLabel = modifiers.outside
    ? format(day.date, "MMM do", { locale: dateLocale(i18n.language) }).toLocaleUpperCase(
        i18n.language
      )
    : format(day.date, "d", { locale: dateLocale(i18n.language) })

  return (
    <div className="relative size-full min-w-0">
      <CalendarDayButton
        day={day}
        modifiers={modifiers}
        {...buttonProps}
        className={cn(
          "aspect-auto h-full min-h-0 min-w-0 items-end justify-start overflow-hidden p-1 pt-0.5 text-right text-lg font-semibold sm:p-1.5 sm:pt-1 sm:text-2xl",
          stateClassName(modifiers),
          modifiers.today ? "ring-2 ring-inset ring-primary" : "ring-1 ring-inset ring-border"
        )}
      >
        <span
          className={
            modifiers.outside
              ? "max-w-full truncate text-[8px] min-[380px]:text-[9px] sm:text-xs"
              : ""
          }
        >
          {dayLabel}
        </span>
      </CalendarDayButton>
      {holiday && (
        <span
          title={`${t("holiday")}: ${localize(holiday.name, i18n.language)}`}
          className="pointer-events-none absolute bottom-1 left-1 right-1 z-20 truncate border border-destructive/70 bg-destructive/55 px-1 py-0.5 text-left text-[8px] font-semibold leading-tight text-foreground shadow-sm sm:bottom-1.5 sm:left-1.5 sm:right-1.5 sm:line-clamp-2 sm:px-1.5 sm:py-1 sm:text-[10px]"
        >
          <span className="uppercase tracking-wide">{t("holiday")}</span>
          <span className="hidden truncate normal-case tracking-normal sm:block">
            {localize(holiday.name, i18n.language)}
          </span>
        </span>
      )}
      {showActivity && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-1.5 left-1.5 z-20 size-2 rounded-full ring-1 ring-foreground/25 sm:size-2.5",
            activityClassName(activity)
          )}
        />
      )}
    </div>
  )
}
