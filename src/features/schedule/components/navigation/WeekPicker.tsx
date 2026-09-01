import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { appCalendarDate, dateKey, dateLocale } from "@/lib/date"
import { cn } from "@/lib/utils"

interface IProps {
  selected: Date
  onSelect: (date: Date) => void
  onOpenCalendar: () => void
}

/** Navigates nearby weekdays and opens the full schedule calendar. */
export const WeekPicker = ({ selected, onSelect, onOpenCalendar }: IProps) => {
  const { t, i18n } = useTranslation()

  const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
  const days = Array.from({ length: 5 }, (_, index) => addDays(weekStart, index))

  return (
    <div className="space-y-3 border-b p-3">
      <p className="text-left text-sm font-semibold capitalize text-foreground">
        {format(selected, "LLLL yyyy", { locale: dateLocale(i18n.language) })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={t("previousWeek")}
          onClick={() =>
            onSelect(addDays(startOfWeek(addWeeks(selected, -1), { weekStartsOn: 1 }), 4))
          }
        >
          <ChevronLeft />
        </Button>
        <div className="grid min-w-0 flex-1 grid-cols-5 gap-1.5">
          {days.map((day) => {
            const current = isSameDay(day, appCalendarDate())
            const selectedDay = isSameDay(day, selected)

            return (
              <Button
                key={dateKey(day)}
                variant={selectedDay ? "default" : "outline"}
                className={cn(
                  "h-10 min-w-0 flex-col px-1 py-1",
                  current && !selectedDay && "border-primary bg-primary/10 font-bold text-primary"
                )}
                onClick={() => onSelect(day)}
              >
                <span className="text-[9px] uppercase">
                  {format(day, "EEE", { locale: dateLocale(i18n.language) })}
                </span>
                <span>{format(day, "d")}</span>
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={t("nextWeek")}
          onClick={() => onSelect(startOfWeek(addWeeks(selected, 1), { weekStartsOn: 1 }))}
        >
          <ChevronRight />
        </Button>
      </div>
      <Button
        data-modal-opener="calendar"
        variant="outline"
        className="w-full"
        onClick={onOpenCalendar}
      >
        <CalendarDays />
        {t("openCalendar")}
      </Button>
    </div>
  )
}
