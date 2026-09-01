import { PARAGRAPH_BREAK_PATTERN } from "@/constants"
import { cn } from "@/lib/utils"

import type { ReactElement } from "react"

interface IProps {
  text: string
  className?: string
}

/** Renders guide copy with consistent readable formatting. */
export const GuideDescription = ({ text, className }: IProps): ReactElement => (
  <div className={cn("space-y-2", className)}>
    {text.split(PARAGRAPH_BREAK_PATTERN).map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}
  </div>
)
