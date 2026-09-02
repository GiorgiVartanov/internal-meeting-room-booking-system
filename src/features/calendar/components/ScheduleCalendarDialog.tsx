import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ModalGuide, ModalGuideQuestionButton } from "@/features/guide"
import { cn } from "@/lib/utils"
import type { IBookingDayActivity, IHoliday } from "@/types"

import { BookingCalendar } from "./BookingCalendar"
import { CalendarMineFilter } from "./CalendarMineFilter"

import type { ReactElement } from "react"

interface IProps {
  open: boolean
  selected: Date
  activity: IBookingDayActivity[]
  myActivity: IBookingDayActivity[]
  holidays: IHoliday[]
  onOpenChange: (open: boolean) => void
  onSelect: (date: Date) => void
  title?: string
  showMineFilter?: boolean
  selectedWeekStart?: Date
}

/** Lets employees select a schedule week from a large calendar dialog. */
export const ScheduleCalendarDialog = ({
  open,
  selected,
  activity,
  myActivity,
  holidays,
  onOpenChange,
  onSelect,
  title: titleText,
  showMineFilter = true,
  selectedWeekStart,
}: IProps): ReactElement => {
  const { t } = useTranslation()
  const [onlyMine, setOnlyMine] = useState(false)
  const [showGuideOpener, setShowGuideOpener] = useState(false)
  const [yearViewOpen, setYearViewOpen] = useState(false)

  const title = (
    <div className="min-w-0">
      <DialogTitle className="truncate">{titleText ?? t("chooseDate")}</DialogTitle>
    </div>
  )
  const filter = showMineFilter ? (
    <CalendarMineFilter
      selected={onlyMine}
      onToggle={() => setOnlyMine((value) => !value)}
    />
  ) : null

  return (
    <>
      <Dialog
        open={open && !showGuideOpener}
        onOpenChange={(next) => {
          if (!showGuideOpener) onOpenChange(next)
        }}
      >
        <DialogContent
          className={cn(
            "flex h-[89dvh] w-[calc(100%-1rem)] max-w-6xl flex-col overflow-hidden p-2 sm:max-w-6xl",
            yearViewOpen && "h-[calc(94dvh-0.75rem)] max-h-[calc(94dvh-0.75rem)] overflow-hidden"
          )}
        >
          <ModalGuideQuestionButton guideId="calendar" />
          <div
            data-modal-guide="calendar"
            className="min-h-0 flex-1"
          >
            <BookingCalendar
              large
              fillWidth
              calendarClassName="bg-popover"
              dayClassName="bg-panel"
              disablePast={false}
              headerClassName="-mx-1"
              headerTitle={title}
              headerActions={filter}
              activity={onlyMine ? myActivity : activity}
              holidays={holidays}
              selected={selected}
              selectedWeekStart={selectedWeekStart}
              showTodayButton
              onYearViewChange={setYearViewOpen}
              onSelect={(date) => {
                onSelect(date)
                onOpenChange(false)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      <ModalGuide
        id="calendar"
        title={titleText ?? t("chooseDate")}
        opener={{
          id: "open",
          title: titleText ?? t("chooseDate"),
          description: t("modalGuideOpenCalendarDescription"),
          selector: '[data-modal-opener="calendar"]',
        }}
        steps={[
          {
            id: "calendar",
            title: titleText ?? t("chooseDate"),
            description: t("modalGuideCalendarDescription"),
            selector: '[data-modal-guide="calendar"]',
          },
        ]}
        onShowOpener={setShowGuideOpener}
      />
    </>
  )
}
