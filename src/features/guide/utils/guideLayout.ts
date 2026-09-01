import type { TGuidePage } from "@/types"

import type { CSSProperties } from "react"

export const guidePageNames: TGuidePage[] = ["booking", "schedule", "dashboard"]
export const DRAWER_GUIDE_DELAY = 250
export const MOBILE_DRAWER_BOOKING_STEPS = new Set([
  "date",
  "time-selection",
  "filters",
  "any-room",
  "search",
  "editor",
])

const TOOLTIP_GAP = 12
const VIEWPORT_MARGIN = 12
const VIEWPORT_TOP_MARGIN = 76
const TOOLTIP_MAX_WIDTH = 320
const TOOLTIP_MIN_SIDE_WIDTH = 220
const TOOLTIP_ESTIMATED_HEIGHT = 300

/** Constrains a guide coordinate to a safe viewport interval. */
const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

/** Clips target bounds to the visible viewport for reliable guide positioning. */
export const getVisibleBounds = (bounds: DOMRect): DOMRect => {
  const left = clamp(bounds.left, 0, window.innerWidth)
  const right = clamp(bounds.right, 0, window.innerWidth)
  const top = clamp(bounds.top, 0, window.innerHeight)
  const bottom = clamp(bounds.bottom, 0, window.innerHeight)

  return DOMRect.fromRect({ x: left, y: top, width: right - left, height: bottom - top })
}

/** Calculates a viewport-safe tooltip position around an optional guide target. */
export const getTooltipStyle = (targetBounds?: DOMRect): CSSProperties => {
  if (!targetBounds) return { left: "50%", top: "25%", transform: "translateX(-50%)" }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const availableRight = viewportWidth - targetBounds.right - TOOLTIP_GAP - VIEWPORT_MARGIN
  const availableLeft = targetBounds.left - TOOLTIP_GAP - VIEWPORT_MARGIN
  const availableBelow = viewportHeight - targetBounds.bottom - TOOLTIP_GAP - VIEWPORT_MARGIN
  const availableAbove = targetBounds.top - TOOLTIP_GAP - VIEWPORT_TOP_MARGIN
  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2)
  const tooltipTop = clamp(
    targetBounds.top,
    VIEWPORT_TOP_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewportHeight - TOOLTIP_ESTIMATED_HEIGHT - VIEWPORT_MARGIN)
  )

  if (availableRight >= TOOLTIP_MIN_SIDE_WIDTH)
    return {
      left: targetBounds.right + TOOLTIP_GAP,
      top: tooltipTop,
      width: Math.min(TOOLTIP_MAX_WIDTH, availableRight),
    }

  if (availableLeft >= TOOLTIP_MIN_SIDE_WIDTH) {
    const width = Math.min(TOOLTIP_MAX_WIDTH, availableLeft)

    return { left: targetBounds.left - TOOLTIP_GAP - width, top: tooltipTop, width }
  }

  const tooltipLeft = clamp(
    targetBounds.left,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewportWidth - tooltipWidth - VIEWPORT_MARGIN)
  )

  if (availableBelow >= TOOLTIP_ESTIMATED_HEIGHT)
    return { left: tooltipLeft, top: targetBounds.bottom + TOOLTIP_GAP, width: tooltipWidth }

  if (availableAbove >= TOOLTIP_ESTIMATED_HEIGHT)
    return {
      bottom: viewportHeight - targetBounds.top + TOOLTIP_GAP,
      left: tooltipLeft,
      width: tooltipWidth,
    }

  return { left: tooltipLeft, top: VIEWPORT_TOP_MARGIN, width: tooltipWidth }
}
