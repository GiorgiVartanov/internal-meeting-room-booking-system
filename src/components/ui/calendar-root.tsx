import { cn } from "@/lib/utils"

import type { RootProps } from "react-day-picker"

interface IProps extends RootProps {
  className?: RootProps["className"]
}

export const CalendarRoot = ({ className, rootRef, ...props }: IProps) => (
  <div
    data-slot="calendar"
    ref={rootRef}
    className={cn(className)}
    {...props}
  />
)
