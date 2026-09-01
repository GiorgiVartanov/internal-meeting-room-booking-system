import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

import { GuideDescription } from "./GuideDescription"

import type { IModalGuideStep } from "./ModalGuide"

interface IProps {
  id: string
  title: string
  steps: IModalGuideStep[]
  stepIndex: number
  onStepIndex: (index: number) => void
  onShowOpener: (show: boolean) => void
  onClose: () => void
}

const TOOLTIP_TOP_MARGIN = 76
const TOOLTIP_GAP = 12
const TOOLTIP_MAX_WIDTH = 320
const TOOLTIP_MIN_SIDE_WIDTH = 220
const TOOLTIP_ESTIMATED_HEIGHT = 220
const GUIDE_CONTROLS_RESERVED_HEIGHT = 150
const VIEWPORT_MARGIN = 12
const TARGET_MOUNT_GRACE_MS = 1_500

/** Constrains a guide measurement to the supplied viewport bounds. */
const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

/** Finds the first rendered and visible element matching a guide selector. */
const findVisibleTarget = (selector: string) =>
  [...document.querySelectorAll<HTMLElement>(selector)].find((element) => {
    const rectangle = element.getBoundingClientRect()

    return rectangle.width > 0 && rectangle.height > 0
  })

/** Runs an active modal guide and positions its tooltip around each target. */
export const ModalGuideSession = ({
  title,
  steps,
  stepIndex,
  onStepIndex,
  onShowOpener,
  onClose,
}: IProps) => {
  const { t } = useTranslation()
  const [bounds, setBounds] = useState<DOMRect>()

  const step = steps[stepIndex]

  useEffect(() => {
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener("keydown", closeFromKeyboard, true)

    return () => window.removeEventListener("keydown", closeFromKeyboard, true)
  }, [onClose])

  useEffect(() => {
    if (!step) return
    const findTarget = () => findVisibleTarget(step.selector)
    let missingTargetTimer: number | undefined
    let openerTarget: HTMLElement | undefined
    let settleFrame: number | undefined
    const settleUntil = performance.now() + 300

    const advanceFromOpener = () => {
      if (stepIndex !== 0) return
      onShowOpener(false)
      queueMicrotask(() => onStepIndex(1))
    }

    const update = () => {
      const target = findTarget()
      if (!target && stepIndex > 0) {
        setBounds(undefined)
        missingTargetTimer ??= window.setTimeout(() => {
          if (!findTarget()) onClose()
        }, TARGET_MOUNT_GRACE_MS)

        return
      }
      if (!target) {
        setBounds(undefined)

        return
      }
      window.clearTimeout(missingTargetTimer)
      missingTargetTimer = undefined
      if (stepIndex === 0 && openerTarget !== target) {
        openerTarget?.removeEventListener("click", advanceFromOpener)
        target.addEventListener("click", advanceFromOpener)
        openerTarget = target
      }
      const rectangle = target.getBoundingClientRect()
      const left = clamp(rectangle.left, 0, window.innerWidth)
      const right = clamp(rectangle.right, 0, window.innerWidth)
      const top = clamp(rectangle.top, 0, window.innerHeight)
      const bottom = clamp(rectangle.bottom, 0, window.innerHeight)
      setBounds(DOMRect.fromRect({ x: left, y: top, width: right - left, height: bottom - top }))
      if (performance.now() < settleUntil) {
        window.cancelAnimationFrame(settleFrame ?? 0)
        settleFrame = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("resize", update)
    document.addEventListener("scroll", update, true)
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      openerTarget?.removeEventListener("click", advanceFromOpener)
      window.cancelAnimationFrame(settleFrame ?? 0)
      window.clearTimeout(missingTargetTimer)
      window.removeEventListener("resize", update)
      document.removeEventListener("scroll", update, true)
      observer.disconnect()
    }
  }, [onClose, onShowOpener, onStepIndex, step, stepIndex])

  if (!step) return null

  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
  const availableRight = bounds
    ? window.innerWidth - bounds.right - TOOLTIP_GAP - VIEWPORT_MARGIN
    : 0
  const availableLeft = bounds ? bounds.left - TOOLTIP_GAP - VIEWPORT_MARGIN : 0
  const fitsOnRight = availableRight >= TOOLTIP_MIN_SIDE_WIDTH
  const fitsOnLeft = availableLeft >= TOOLTIP_MIN_SIDE_WIDTH
  let cardWidth = tooltipWidth
  if (fitsOnLeft) cardWidth = Math.min(tooltipWidth, availableLeft)
  if (fitsOnRight) cardWidth = Math.min(tooltipWidth, availableRight)

  let left = VIEWPORT_MARGIN
  if (bounds)
    left = clamp(bounds.left, VIEWPORT_MARGIN, window.innerWidth - tooltipWidth - VIEWPORT_MARGIN)
  if (bounds && fitsOnLeft) left = bounds.left - TOOLTIP_GAP - cardWidth
  if (bounds && fitsOnRight) left = bounds.right + TOOLTIP_GAP
  const guideControlsWidth = Math.min(400, window.innerWidth - VIEWPORT_MARGIN * 2)
  const guideControlsLeft = window.innerWidth - guideControlsWidth - VIEWPORT_MARGIN
  const overlapsGuideControlsHorizontally = left + cardWidth > guideControlsLeft - TOOLTIP_GAP
  const maximumTop = Math.max(
    TOOLTIP_TOP_MARGIN,
    window.innerHeight -
      (overlapsGuideControlsHorizontally ? GUIDE_CONTROLS_RESERVED_HEIGHT : VIEWPORT_MARGIN) -
      TOOLTIP_ESTIMATED_HEIGHT -
      TOOLTIP_GAP
  )
  let preferredTop = TOOLTIP_TOP_MARGIN
  if (bounds) preferredTop = bounds.bottom + TOOLTIP_GAP
  if (bounds && bounds.top >= TOOLTIP_TOP_MARGIN + TOOLTIP_ESTIMATED_HEIGHT + TOOLTIP_GAP)
    preferredTop = bounds.top - TOOLTIP_ESTIMATED_HEIGHT - TOOLTIP_GAP
  if (bounds && (fitsOnLeft || fitsOnRight)) preferredTop = bounds.top
  const cardStyle = {
    left,
    top: clamp(preferredTop, TOOLTIP_TOP_MARGIN, maximumTop),
    width: cardWidth,
    maxHeight: `calc(100dvh - ${TOOLTIP_TOP_MARGIN + VIEWPORT_MARGIN}px)`,
    overflowY: "auto" as const,
  }

  const next = () => {
    if (stepIndex === 0) {
      const opener = findVisibleTarget(step.selector)
      if (opener) {
        opener.click()

        return
      }

      return
    }
    if (stepIndex < steps.length - 1) {
      onStepIndex(stepIndex + 1)

      return
    }
    onClose()
  }
  const previous = () => {
    if (stepIndex === 1) onShowOpener(true)
    onStepIndex(stepIndex - 1)
  }

  return createPortal(
    <>
      {bounds && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[80] border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgb(0_0_0/0.3)]"
          style={{
            left: bounds.left - 4,
            top: bounds.top - 4,
            width: bounds.width + 8,
            height: bounds.height + 8,
          }}
        />
      )}
      <section
        data-guide-tooltip
        className="fixed z-[90] border bg-popover p-4 shadow-xl"
        style={cardStyle}
      >
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={onClose}
          aria-label={t("guideClose")}
        >
          <X />
        </Button>
        <p className="pr-7 text-xs text-primary">
          {t("guideStepCount", { current: stepIndex + 1, total: steps.length })}
        </p>
        <h2 className="mt-1 font-semibold">{step.title}</h2>
        <GuideDescription
          className="mt-2 text-sm leading-6 text-muted-foreground"
          text={step.description}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            size="icon"
            variant="outline"
            aria-label={t("guidePrevious")}
            disabled={stepIndex === 0}
            onClick={previous}
          >
            <ArrowLeft />
          </Button>
          <Button
            size="icon"
            aria-label={stepIndex === steps.length - 1 ? t("guideClose") : t("guideNext")}
            disabled={stepIndex === 0 && !bounds}
            onClick={next}
          >
            {stepIndex === steps.length - 1 ? <X /> : <ArrowRight />}
          </Button>
        </div>
      </section>
      <aside
        data-guide-controls="modal"
        className="fixed bottom-3 right-3 z-[95] w-[min(400px,calc(100vw-24px))] border bg-background p-3 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <strong className="text-sm">{t("guidePanelTitle", { page: title })}</strong>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label={t("guideClose")}
          >
            <X />
          </Button>
        </div>
        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <Button
            className="w-full"
            variant="outline"
            disabled={stepIndex === 0}
            onClick={previous}
          >
            <ArrowLeft />
          </Button>
          <Button
            className="w-full"
            disabled={stepIndex === 0 && !bounds}
            onClick={next}
          >
            {stepIndex === steps.length - 1 ? t("guideClose") : t("guideNext")}
            {stepIndex < steps.length - 1 && <ArrowRight />}
          </Button>
        </div>
      </aside>
    </>,
    document.body
  )
}
