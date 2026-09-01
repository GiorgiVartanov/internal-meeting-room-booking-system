import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWeekend,
  setMonth as setCalendarMonth,
  setYear,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  ALLOW_HOLIDAY_BOOKINGS,
  ALLOW_WEEKEND_BOOKINGS,
  CALENDAR_FUTURE_MONTHS,
  CALENDAR_PAST_MONTHS,
} from "@/constants"
import { appCalendarDate, appDateKey, dateLocale } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { IBooking, IBookingDayActivity, IHoliday } from "@/types"

import { BookingCalendarContext } from "../context"

import { BookingCalendarDayButton } from "./BookingCalendarDayButton"
import { MonthPickerCard } from "./MonthPickerCard"

import type { ReactElement, ReactNode } from "react"

interface IProps {
  bookings?: IBooking[]
  activity?: IBookingDayActivity[]
  holidays: IHoliday[]
  selected?: Date
  onSelect: (date: Date) => void
  large?: boolean
  disablePast?: boolean
  showBlockedSelection?: boolean
  headerActions?: ReactNode
  headerTitle?: ReactNode
  fillWidth?: boolean
  selectedWeekStart?: Date
  showTodayButton?: boolean
  dayClassName?: string
  calendarClassName?: string
  headerClassName?: string
  bodyFallback?: ReactNode
  onYearViewChange?: (open: boolean) => void
  horizontalYearScroll?: boolean
  showMonthPickerTitle?: boolean
}

/** Renders the shared booking calendar with availability activity and navigation. */
export const BookingCalendar = ({
  bookings = [],
  activity,
  holidays,
  selected,
  onSelect,
  large,
  disablePast = true,
  showBlockedSelection = false,
  headerActions,
  headerTitle,
  fillWidth = false,
  selectedWeekStart,
  showTodayButton = true,
  dayClassName = "bg-background",
  calendarClassName,
  headerClassName,
  bodyFallback,
  onYearViewChange,
  horizontalYearScroll = false,
  showMonthPickerTitle = true,
}: IProps): ReactElement => {
  const { t, i18n } = useTranslation()

  const today = appCalendarDate()
  const currentMonth = startOfMonth(today)

  const [month, setMonth] = useState(() => startOfMonth(selected ?? appCalendarDate()))
  const [choosingMonth, setChoosingMonth] = useState(false)

  useEffect(() => {
    if (!selected) return
    const frame = window.requestAnimationFrame(() => setMonth(startOfMonth(selected)))

    return () => window.cancelAnimationFrame(frame)
  }, [selected])

  useEffect(() => {
    onYearViewChange?.(choosingMonth)
  }, [choosingMonth, onYearViewChange])

  useEffect(() => {
    if (!choosingMonth) return
    const closeYearView = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopImmediatePropagation()
      setChoosingMonth(false)
    }
    window.addEventListener("keydown", closeYearView, true)

    return () => window.removeEventListener("keydown", closeYearView, true)
  }, [choosingMonth])

  const availability = useMemo(
    () =>
      activity
        ? Object.fromEntries(activity.map((item) => [item.date, item.availability]))
        : Object.fromEntries(
            [...new Set(bookings.map((booking) => appDateKey(booking.startAt)))].map((date) => [
              date,
              "low" as const,
            ])
          ),
    [activity, bookings]
  )

  let earliestDate = currentMonth
  if (bookings.length)
    earliestDate = new Date(
      Math.min(...bookings.map((booking) => new Date(booking.startAt).getTime()))
    )
  if (activity?.[0]?.date)
    earliestDate = new Date(`${activity.map((item) => item.date).sort()[0]}T12:00:00`)
  const dataEarliest = startOfMonth(earliestDate)
  const policyEarliest = startOfMonth(subMonths(currentMonth, CALENDAR_PAST_MONTHS))
  const earliest = dataEarliest < policyEarliest ? dataEarliest : policyEarliest
  const latest = startOfMonth(addMonths(currentMonth, CALENDAR_FUTURE_MONTHS))
  const holidayDates = holidays.map((holiday) => new Date(`${holiday.date}T12:00:00`))
  const holidayDateKeys = new Set(holidays.map((holiday) => holiday.date))
  const holidaysByDate = Object.fromEntries(holidays.map((holiday) => [holiday.date, holiday]))
  const disabled = [
    ...(!ALLOW_WEEKEND_BOOKINGS ? [{ dayOfWeek: [0, 6] }] : []),
    ...(!ALLOW_HOLIDAY_BOOKINGS ? holidayDates : []),
    ...(disablePast ? [{ before: startOfDay(today) }] : []),
  ]
  const selectedIsBlocked =
    !showBlockedSelection &&
    selected &&
    ((!ALLOW_WEEKEND_BOOKINGS && isWeekend(selected)) ||
      (!ALLOW_HOLIDAY_BOOKINGS && holidayDates.some((date) => isSameDay(date, selected))) ||
      (disablePast && isBefore(selected, startOfDay(today))))

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col",
        horizontalYearScroll && "dashboard-year-calendar"
      )}
    >
      {large && (
        <div
          className={cn(
            "sticky top-0 z-30 -mx-2 mb-3 grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b bg-popover px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(2.5rem,1fr)]",
            headerClassName
          )}
        >
          <div className="col-span-2 min-w-0 pr-20 sm:col-span-1 sm:pr-0">{headerTitle}</div>
          <div className="col-span-2 row-start-2 flex min-w-0 items-center justify-center gap-0.5 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 border-transparent bg-transparent"
              disabled={month <= earliest}
              aria-label={t("previousMonth")}
              onClick={() => setMonth((current) => subMonths(current, 1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-36 truncate text-center text-sm font-semibold capitalize"
              aria-label={t("chooseMonth")}
              onClick={() => setChoosingMonth(true)}
            >
              {format(month, "LLLL yyyy", { locale: dateLocale(i18n.language) })}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 border-transparent bg-transparent"
              disabled={month >= latest}
              aria-label={t("nextMonth")}
              onClick={() => setMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
          <div className="col-span-2 row-start-3 flex flex-wrap items-center justify-center gap-2 sm:col-span-1 sm:col-start-3 sm:row-start-1 sm:flex-nowrap sm:justify-end sm:whitespace-nowrap">
            {showTodayButton && !isSameMonth(month, currentMonth) && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => {
                  setMonth(currentMonth)
                  onSelect(today)
                }}
              >
                {t("goToCurrentMonth")}
              </Button>
            )}
            {headerActions}
          </div>
        </div>
      )}
      {choosingMonth && (
        <div className="absolute inset-0 z-40 overflow-x-hidden overflow-y-auto bg-popover">
          <div className="flex h-full min-h-0 flex-col">
            <div
              className={cn(
                "sticky top-0 z-30 -mx-2 mb-3 grid min-h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(2.5rem,1fr)] items-center gap-2 border-b bg-popover px-3 py-2",
                headerClassName
              )}
            >
              {showMonthPickerTitle && (
                <span className="font-heading truncate text-base font-semibold">
                  {t("chooseMonth")}
                </span>
              )}
              {!showMonthPickerTitle && <div aria-hidden="true" />}
              <div className="flex min-w-0 items-center justify-center gap-0.5 sm:gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8 border-transparent bg-transparent"
                  disabled={month.getFullYear() <= earliest.getFullYear()}
                  aria-label={t("previousYear")}
                  onClick={() => setMonth((current) => setYear(current, current.getFullYear() - 1))}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-36 truncate text-center text-sm font-semibold"
                  aria-label={t("backToSelectedMonth")}
                  onClick={() => setChoosingMonth(false)}
                >
                  {month.getFullYear()}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8 border-transparent bg-transparent"
                  disabled={month.getFullYear() >= latest.getFullYear()}
                  aria-label={t("nextYear")}
                  onClick={() => setMonth((current) => setYear(current, current.getFullYear() + 1))}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
              <div />
            </div>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-x-hidden",
                horizontalYearScroll && "dashboard-year-calendar-scroll"
              )}
            >
              <div
                className={cn(
                  "grid h-full min-h-0 auto-rows-max grid-cols-2 items-start gap-1 overflow-y-auto sm:grid-cols-3 sm:gap-1.5 lg:mx-auto lg:w-[calc(100%_-_1rem)] lg:max-w-[1200px] lg:grid-cols-4 lg:grid-rows-3 lg:auto-rows-fr lg:gap-2 lg:overflow-hidden",
                  horizontalYearScroll && "dashboard-year-calendar-grid"
                )}
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const candidate = startOfMonth(setCalendarMonth(month, index))
                  const unavailable = candidate < earliest || candidate > latest

                  return (
                    <MonthPickerCard
                      key={index}
                      month={candidate}
                      selected={isSameMonth(candidate, month)}
                      disabled={unavailable}
                      holidayDates={holidayDateKeys}
                      onSelect={() => {
                        setMonth(candidate)
                        setChoosingMonth(false)
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className={`min-h-0 flex-1 overflow-x-hidden [container-type:inline-size] ${fillWidth ? "overflow-y-hidden lg:overflow-x-auto" : "overflow-y-auto"}`}
      >
        {bodyFallback !== undefined ? (
          bodyFallback
        ) : (
          <BookingCalendarContext.Provider value={{ availability, holidaysByDate }}>
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              startMonth={earliest}
              endMonth={endOfMonth(addMonths(currentMonth, CALENDAR_FUTURE_MONTHS))}
              selected={selectedIsBlocked ? undefined : selected}
              onSelect={(date) => date && onSelect(date)}
              disabled={disabled}
              weekStartsOn={1}
              fixedWeeks
              showOutsideDays
              locale={dateLocale(i18n.language)}
              modifiers={{
                holiday: holidayDates,
                weekend: { dayOfWeek: [0, 6] },
                ...(selectedWeekStart
                  ? { selectedWeek: { from: selectedWeekStart, to: addDays(selectedWeekStart, 6) } }
                  : {}),
              }}
              modifiersClassNames={{
                holiday: "text-destructive",
                weekend: "text-muted-foreground",
                selectedWeek: "bg-primary/10",
              }}
              classNames={{
                root: fillWidth
                  ? "mx-auto h-auto w-full max-w-[1200px] lg:w-[calc(100%_-_1rem)] lg:min-w-[840px]"
                  : "mx-auto h-auto w-full min-w-0 max-w-[min(1200px,calc((100dvh-9rem)*14/9))]",
                months: "h-auto w-full",
                month: "h-auto min-h-0 w-full gap-1 sm:gap-2",
                month_grid: "flex h-auto min-h-0 w-full flex-col",
                weekdays: "grid grid-cols-7 gap-1 sm:gap-2",
                weekday:
                  "w-auto py-1 pr-1 text-right text-[10px] font-semibold text-foreground sm:py-2 sm:pr-2 sm:text-xs",
                weeks: `grid min-h-0 w-full flex-none grid-rows-6 gap-1 sm:gap-2 ${fillWidth ? "aspect-[7/6] lg:aspect-[2/1]" : "aspect-[7/6] min-[850px]:aspect-[14/9]"}`,
                week: "mt-0 grid min-h-0 w-full grid-cols-7 gap-1 sm:gap-2",
                day: `relative h-full min-h-0 w-full p-0 text-center ${dayClassName}`,
                outside: "text-muted-foreground opacity-60 dark:opacity-35",
                disabled: "text-muted-foreground opacity-75 dark:opacity-50",
                nav: large
                  ? "hidden"
                  : "absolute inset-x-0 top-0 z-30 flex w-full items-center justify-between gap-1",
                month_caption: large ? "hidden" : undefined,
                button_previous: large
                  ? "size-12 border bg-background shadow-sm hover:bg-muted [&_svg]:size-7"
                  : "size-8 border bg-background shadow-sm hover:bg-muted",
                button_next: large
                  ? "size-12 border bg-background shadow-sm hover:bg-muted [&_svg]:size-7"
                  : "size-8 border bg-background shadow-sm hover:bg-muted",
              }}
              className={cn("h-full w-full p-0", calendarClassName)}
              components={{ DayButton: BookingCalendarDayButton }}
            />
          </BookingCalendarContext.Provider>
        )}
      </div>
    </div>
  )
}
