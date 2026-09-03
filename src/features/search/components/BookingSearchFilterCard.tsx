import { cn } from "@/lib/utils"

import type { ReactElement, ReactNode } from "react"

interface IProps {
  selected: boolean
  children: ReactNode
  onSelect: () => void
}

/** Provides consistent selection and hover feedback for booking-search entity filters. */
export const BookingSearchFilterCard = ({ selected, children, onSelect }: IProps): ReactElement => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      "flex h-full flex-col items-stretch justify-start border p-2 text-left outline outline-0 outline-primary/40 transition-colors hover:border-primary/70 hover:bg-accent/70",
      selected && "border-primary bg-primary/10 outline-2 -outline-offset-2"
    )}
    onClick={onSelect}
  >
    {children}
  </button>
)
