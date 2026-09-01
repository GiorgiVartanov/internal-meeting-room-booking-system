import { addDays, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { dateKey, dateLocale } from "@/lib/date"

import type { ReactElement } from "react"

interface IProps {
  month: Date
  selected: boolean
  disabled: boolean
  holidayDates: ReadonlySet<string>
  onSelect: () => void
}

/** Displays one navigable month within the large calendar experience. */
export const MonthPickerCard = ({
  month,
  selected,
  disabled,
  holidayDates,
  onSelect,
}: IProps): ReactElement => {
  const { i18n } = useTranslation()

  const locale = dateLocale(i18n.language)
  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const days = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index))
  const weekdays = Array.from({ length: 7 }, (_, index) => addDays(calendarStart, index))

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={format(month, "LLLL yyyy", { locale })}
      className={cn(
        "flex aspect-[7/5] min-h-0 w-full flex-col rounded-none border bg-popover p-1 text-left transition-colors hover:border-primary/70 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35 sm:p-1.5 lg:h-full lg:aspect-auto lg:p-2",
        selected && "border-primary bg-primary/10"
      )}
      onClick={onSelect}
    >
      <strong className="mb-1 self-center text-xs capitalize sm:mb-1.5 sm:text-[13px] lg:mb-2 lg:text-sm">
        {format(month, "MMM", { locale })}
      </strong>
      <span
        aria-hidden="true"
        className="grid min-h-0 flex-1 grid-cols-7 grid-rows-7 gap-y-0 text-center text-[7px] min-[380px]:text-[8px] sm:text-[9px] lg:text-[10px] xl:text-[11px]"
      >
        {weekdays.map((day) => (
          <span
            key={day.toISOString()}
            className="font-medium text-muted-foreground"
          >
            {format(day, "EEEEE", { locale })}
          </span>
        ))}
        {days.map((day) => (
          <span
            key={day.toISOString()}
            className={cn(
              "flex size-3 min-h-0 self-center justify-self-center items-center justify-center text-[7px] leading-none text-foreground min-[380px]:size-3.5 min-[380px]:text-[8px] sm:text-[9px] sm:leading-4 lg:text-[10px] lg:leading-4 xl:text-[11px]",
              !isSameMonth(day, month) && "text-muted-foreground/35",
              isSameMonth(day, month) &&
                holidayDates.has(dateKey(day)) &&
                "bg-destructive/70 text-destructive-foreground opacity-70"
            )}
          >
            {format(day, "d")}
          </span>
        ))}
      </span>
    </button>
  )
}
