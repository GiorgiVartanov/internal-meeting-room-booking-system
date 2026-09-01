import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ChevronProps } from "react-day-picker"

interface IProps extends ChevronProps {
  orientation?: ChevronProps["orientation"]
}

export const CalendarChevron = ({ className, orientation, ...props }: IProps) => {
  if (orientation === "left")
    return (
      <ChevronLeftIcon
        className={cn("size-4", className)}
        {...props}
      />
    )

  if (orientation === "right")
    return (
      <ChevronRightIcon
        className={cn("size-4", className)}
        {...props}
      />
    )

  return (
    <ChevronDownIcon
      className={cn("size-4", className)}
      {...props}
    />
  )
}
