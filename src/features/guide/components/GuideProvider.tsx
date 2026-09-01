import { ArrowLeft, ArrowRight, BookOpen, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { PATHS } from "@/constants"
import { ApiErrorAlert } from "@/components/ApiErrorAlert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGuideProgress, useUpdateGuideProgress } from "@/hooks"
import type { TGuidePage } from "@/types"

import { GuideContext } from "../context"
import { guidePageForPath, guidePages } from "../data"
import {
  DRAWER_GUIDE_DELAY,
  getTooltipStyle,
  getVisibleBounds,
  guidePageNames,
  MOBILE_DRAWER_BOOKING_STEPS,
  preloadModalGuides,
} from "../utils"

import { GuideDescription } from "./GuideDescription"

import type { ReactNode } from "react"

interface IProps {
  children: ReactNode
}

/** Provides application-wide state and controls for interactive product guides. */
export const GuideProvider = ({ children }: IProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const progress = useGuideProgress()
  const updateProgress = useUpdateGuideProgress()
  const [targetBounds, setTargetBounds] = useState<DOMRect>()

  const currentPage = guidePageNames.find((page) => page === params.get("guide"))
  const pageDefinition = currentPage ? guidePages[currentPage] : undefined
  const requestedStep = params.get("guideStep")
  const stepIndex = pageDefinition
    ? Math.max(
        0,
        pageDefinition.steps.findIndex((step) => step.id === requestedStep)
      )
    : -1
  const step = pageDefinition?.steps[stepIndex]

  const openGuide = useCallback(
    (page: TGuidePage = guidePageForPath(location.pathname), requestedStepId?: string) => {
      void preloadModalGuides()
      const definition = guidePages[page]
      const lastPosition = progress.data?.lastPosition
      const recentlyClosed =
        lastPosition?.page === page &&
        Date.now() - new Date(lastPosition.closedAt).getTime() <= 5 * 60 * 1000
      const next = new URLSearchParams(location.pathname === definition.path ? location.search : "")
      next.set("guide", page)
      next.set(
        "guideStep",
        requestedStepId ?? (recentlyClosed ? lastPosition.stepId : (definition.steps[0]?.id ?? ""))
      )
      void navigate({
        pathname:
          page === guidePageForPath(location.pathname) ? location.pathname : definition.path,
        search: next.toString(),
      })
    },
    [location.pathname, location.search, navigate, progress.data?.lastPosition]
  )

  useEffect(() => {
    if (!step) {
      const clearBoundsFrame = window.requestAnimationFrame(() => setTargetBounds(undefined))

      return () => window.cancelAnimationFrame(clearBoundsFrame)
    }

    const findVisibleTarget = () =>
      [...document.querySelectorAll<HTMLElement>(step.selector)].find((element) => {
        const bounds = element.getBoundingClientRect()

        return (
          bounds.width > 0 &&
          bounds.height > 0 &&
          bounds.right > 0 &&
          bounds.left < window.innerWidth &&
          bounds.bottom > 0 &&
          bounds.top < window.innerHeight
        )
      })

    let drawerFoundAt: number | undefined
    let scrolledTarget: HTMLElement | undefined
    let targetPoll: number | undefined
    const update = () => {
      const target = findVisibleTarget()
      if (!target) {
        setTargetBounds(undefined)

        return
      }

      const drawer = target.closest<HTMLElement>('[data-slot="drawer-popup"]')
      if (drawer) {
        drawerFoundAt ??= performance.now()
        if (performance.now() - drawerFoundAt < DRAWER_GUIDE_DELAY) {
          setTargetBounds(undefined)

          return
        }
      } else drawerFoundAt = undefined

      if (scrolledTarget !== target) {
        target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })
        scrolledTarget = target
      }
      setTargetBounds(getVisibleBounds(target.getBoundingClientRect()))
      window.clearInterval(targetPoll)
      targetPoll = undefined
    }

    targetPoll = window.setInterval(update, 50)
    const stopTargetPoll = window.setTimeout(() => window.clearInterval(targetPoll), 3_000)
    update()
    window.addEventListener("resize", update)
    document.addEventListener("scroll", update, true)

    return () => {
      window.clearInterval(targetPoll)
      window.clearTimeout(stopTargetPoll)
      window.removeEventListener("resize", update)
      document.removeEventListener("scroll", update, true)
    }
  }, [step])

  const removeGuideFromUrl = useCallback(() => {
    const next = new URLSearchParams(params)
    next.delete("guide")
    next.delete("guideStep")
    next.delete("returnDoc")
    setParams(next, { replace: true })
  }, [params, setParams])
  const closeGuide = useCallback(() => {
    if (currentPage && step)
      updateProgress.mutate({
        lastPosition: { page: currentPage, stepId: step.id, closedAt: new Date().toISOString() },
      })
    removeGuideFromUrl()
  }, [currentPage, removeGuideFromUrl, step, updateProgress])

  useEffect(() => {
    if (!currentPage) return
    const closeFromKeyboard = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        document.querySelector('[data-slot="dialog-content"], [data-slot="drawer-popup"]')
      )
        return
      event.preventDefault()
      event.stopImmediatePropagation()
      closeGuide()
    }
    window.addEventListener("keydown", closeFromKeyboard, true)

    return () => window.removeEventListener("keydown", closeFromKeyboard, true)
  }, [closeGuide, currentPage])
  const visitStep = (index: number) => {
    if (!currentPage || !pageDefinition) return
    const nextStep = pageDefinition.steps[index]
    if (!nextStep) return
    const next = new URLSearchParams(params)
    next.set("guide", currentPage)
    next.set("guideStep", nextStep.id)
    setParams(next, { replace: true })
  }
  const showNextStep = () => {
    if (!currentPage || !step) return
    if (pageDefinition && stepIndex < pageDefinition.steps.length - 1) {
      visitStep(stepIndex + 1)

      return
    }
    closeGuide()
  }

  const contextValue = useMemo(() => ({ openGuide }), [openGuide])

  const tooltipStyle = getTooltipStyle(targetBounds)
  const waitsForMobileDrawer = Boolean(
    currentPage === "booking" &&
    step &&
    MOBILE_DRAWER_BOOKING_STEPS.has(step.id) &&
    window.matchMedia("(max-width: 1023px)").matches
  )
  const guideReady = !waitsForMobileDrawer || Boolean(targetBounds)

  return (
    <GuideContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={progress.isSuccess && !progress.data.welcomeSeen && !currentPage}
        onOpenChange={(open) => !open && updateProgress.mutate({ welcomeSeen: true })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("guideWelcomeTitle")}</DialogTitle>
            <DialogDescription>{t("guideWelcomeDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => updateProgress.mutate({ welcomeSeen: true })}
            >
              {t("guideNoThanks")}
            </Button>
            <Button
              variant="outline"
              onClick={() => updateProgress.mutate({ welcomeSeen: true })}
            >
              {t("guideLater")}
            </Button>
            <Button
              onClick={() => {
                updateProgress.mutate({ welcomeSeen: true })
                openGuide()
              }}
            >
              {t("guideStart")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {currentPage && pageDefinition && step && (
        <>
          {guideReady && (
            <>
              {targetBounds && (
                <div
                  aria-hidden
                  className="pointer-events-none fixed z-[80] border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgb(0_0_0/0.38)]"
                  style={{
                    left: targetBounds.left - 4,
                    top: targetBounds.top - 4,
                    width: targetBounds.width + 8,
                    height: targetBounds.height + 8,
                  }}
                />
              )}
              <section
                data-guide-tooltip
                role="dialog"
                aria-label={t(step.titleKey)}
                className="fixed z-[90] max-h-[calc(100dvh-88px)] w-[min(320px,calc(100vw-24px))] overflow-y-auto border bg-popover p-4 text-popover-foreground shadow-xl"
                style={tooltipStyle}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  aria-label={t("guideClose")}
                  onClick={closeGuide}
                >
                  <X />
                </Button>
                <p className="pr-7 text-xs font-medium text-primary">
                  {t("guideStepCount", {
                    current: stepIndex + 1,
                    total: pageDefinition.steps.length,
                  })}
                </p>
                <h2 className="mt-1 font-semibold">{t(step.titleKey)}</h2>
                <GuideDescription
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                  text={t(step.descriptionKey)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={t("guidePrevious")}
                    disabled={stepIndex === 0}
                    onClick={() => visitStep(stepIndex - 1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    size="icon"
                    aria-label={
                      stepIndex === pageDefinition.steps.length - 1
                        ? t("guideClose")
                        : t("guideNext")
                    }
                    onClick={showNextStep}
                  >
                    {stepIndex === pageDefinition.steps.length - 1 ? <X /> : <ArrowRight />}
                  </Button>
                </div>
              </section>
            </>
          )}
          <aside
            data-guide-controls="page"
            className="fixed bottom-3 right-3 z-[95] w-[min(400px,calc(100vw-24px))] border bg-background p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <strong className="text-sm">
                  {t("guidePanelTitle", { page: t(pageDefinition.labelKey) })}
                </strong>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("guideClose")}
                onClick={closeGuide}
              >
                <X />
              </Button>
            </div>
            <div className="mt-2 grid w-full grid-cols-3 gap-1">
              {guidePageNames.map((page) => {
                const definition = guidePages[page]

                return (
                  <Button
                    key={page}
                    size="sm"
                    className="min-w-0 px-2 text-xs"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => openGuide(page)}
                  >
                    <span className="whitespace-nowrap">{t(definition.labelKey)}</span>
                  </Button>
                )
              })}
            </div>
            {(progress.isError || updateProgress.isError) && (
              <div className="mt-2">
                <ApiErrorAlert
                  error={progress.error ?? updateProgress.error}
                  fallback="Guide progress could not be saved."
                />
              </div>
            )}
            <div className="mt-3 flex w-full items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                aria-label={t("guidePrevious")}
                disabled={stepIndex === 0}
                onClick={() => visitStep(stepIndex - 1)}
              >
                <ArrowLeft />
              </Button>
              <Button
                className="flex-1"
                onClick={showNextStep}
              >
                {stepIndex === pageDefinition.steps.length - 1 ? t("guideClose") : t("guideNext")}
                {stepIndex < pageDefinition.steps.length - 1 && <ArrowRight />}
              </Button>
              <Button
                variant="outline"
                className="px-2 text-xs"
                render={
                  <Link
                    to={`${PATHS.documentation}#${params.get("returnDoc") ?? step.documentationSection}`}
                  />
                }
              >
                <BookOpen />
                <span className="hidden sm:inline">Documentation</span>
              </Button>
            </div>
          </aside>
        </>
      )}
    </GuideContext.Provider>
  )
}
