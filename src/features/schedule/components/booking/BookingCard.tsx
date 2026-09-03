import { bookingParticipationClassName } from "@/features/schedule/utils"
import { cn } from "@/lib/utils"
import type { IBooking } from "@/types"

import type { ComponentPropsWithoutRef, FocusEventHandler, ReactElement, ReactNode } from "react"

interface IProps extends Omit<ComponentPropsWithoutRef<"article">, "children"> {
  booking: IBooking
  accessibleLabel: string
  children: ReactNode
  onOpen: () => void
  onTriggerFocus?: FocusEventHandler<HTMLButtonElement>
  participationColors?: boolean
}

/** Provides the shared interaction, participation colors, and focus shell for booking cards. */
export const BookingCard = ({
  booking,
  accessibleLabel,
  children,
  onOpen,
  onTriggerFocus,
  participationColors = true,
  className,
  ...articleProps
}: IProps): ReactElement => (
  <article
    data-booking
    className={cn(
      "group/booking relative overflow-hidden border text-left shadow-sm outline -outline-offset-1 outline-transparent transition-colors hover:border-primary/70 hover:outline-2 hover:outline-primary focus-within:outline-2 focus-within:outline-primary",
      participationColors && bookingParticipationClassName(booking),
      className
    )}
    {...articleProps}
  >
    <button
      data-booking-trigger
      type="button"
      className="absolute inset-0 z-0"
      aria-label={accessibleLabel}
      onClick={onOpen}
      onFocus={onTriggerFocus}
    />
    {children}
  </article>
)
