import { Check, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

import type { ReactElement } from "react"

interface IProps {
  selected: boolean
  onToggle: () => void
}

/** Toggles whether calendar activity is limited to the current employee. */
export const CalendarMineFilter = ({ selected, onToggle }: IProps): ReactElement => {
  const { t } = useTranslation()

  return (
    <Button
      data-guide="dashboard-mine-filter"
      type="button"
      size="icon"
      variant={selected ? "default" : "outline"}
      className="size-8 shrink-0 sm:h-8 sm:w-auto sm:px-3"
      aria-pressed={selected}
      aria-label={t("myBookingsOnly")}
      onClick={onToggle}
    >
      {selected ? <Check /> : <UserRound />}
      <span className="hidden sm:inline">{t("myBookingsOnly")}</span>
    </Button>
  )
}
