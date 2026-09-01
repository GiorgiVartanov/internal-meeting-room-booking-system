import { ChevronDown, ChevronUp } from "lucide-react"

import type { ReactElement } from "react"

interface IProps {
  enabled: boolean
}

/** Provides pointer targets for resizing the start and end of a booking card. */
export const BookingResizeHandles = ({ enabled }: IProps): ReactElement | null =>
  enabled ? (
    <>
      <span
        aria-hidden
        data-resize-handle="start"
        className="group/resize-top absolute inset-x-0 top-0 z-20 flex h-3 max-h-[33%] cursor-ns-resize items-start justify-center"
      >
        <ChevronUp className="size-3 opacity-0 transition-opacity group-hover/resize-top:opacity-80" />
      </span>
      <span
        aria-hidden
        data-resize-handle="end"
        className="group/resize-bottom absolute inset-x-0 bottom-0 z-20 flex h-3 max-h-[33%] cursor-ns-resize items-end justify-center"
      >
        <ChevronDown className="size-3 opacity-0 transition-opacity group-hover/resize-bottom:opacity-80" />
      </span>
    </>
  ) : null
