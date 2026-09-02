import { BookOpen, Clock3, LayoutDashboard, Rows3 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { guidePages } from "@/features/guide"
import { DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"
import { useActiveSection, useBookings } from "@/hooks"
import { appDateKey } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { TGuidePage } from "@/types"

const pageIcons = { booking: Rows3, schedule: Clock3, dashboard: LayoutDashboard }
const pageNames: TGuidePage[] = ["booking", "schedule", "dashboard"]
const modalTopics = [
  [
    "calendar",
    "documentationCalendarDialogTitle",
    "documentationCalendarDialogDescription",
    `${PATHS.home}?modalGuide=calendar&returnDoc=dialogs`,
  ],
  [
    "search",
    "documentationSearchDialogTitle",
    "documentationSearchDialogDescription",
    `${PATHS.home}?modalGuide=booking-search&returnDoc=dialogs`,
  ],
  [
    "details",
    "documentationDetailsDialogTitle",
    "documentationDetailsDialogDescription",
    `${PATHS.schedule}?modalGuide=booking-details&returnDoc=dialogs`,
  ],
  [
    "editing",
    "documentationEditDialogTitle",
    "documentationEditDialogDescription",
    `${PATHS.schedule}?modalGuide=edit-booking&returnDoc=dialogs`,
  ],
] as const
const navigationShortcuts = [
  ["1", "bookingNav"],
  ["2", "schedule"],
  ["3", "dashboard"],
  ["4", "documentation"],
  ["5", "aboutTitle"],
] as const
const documentationOpenedAt = new Date().toISOString()
const documentationSectionIds = [
  "overview",
  ...pageNames.flatMap((page) => [
    page,
    ...guidePages[page].steps.map((step) => step.documentationSection),
  ]),
  "dialogs",
  "keyboard",
] as const

/** Presents searchable guidance for the application's primary workflows. */
const DocumentationPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const scrollContainerRef = useRef<HTMLElement>(null)
  const activeSection = useActiveSection(scrollContainerRef, documentationSectionIds)
  const editableBookings = useBookings({
    organizerId: DEFAULT_EMPLOYEE_ID,
    status: "confirmed",
    from: documentationOpenedAt,
  })

  const editableBooking = editableBookings.data?.find(
    (booking) => new Date(booking.endAt) > new Date()
  )

  const [openSections, setOpenSections] = useState<Record<TGuidePage, string[]>>({
    booking: [],
    schedule: [],
    dashboard: [],
  })

  const tocClassName = (sectionId: string, nested = false) =>
    cn(
      "block border-l-2 py-0.5 transition-colors hover:text-primary",
      nested ? "pl-3 text-xs" : "pl-3 text-sm font-semibold",
      activeSection === sectionId
        ? "border-primary font-semibold text-primary"
        : "border-transparent text-muted-foreground"
    )

  useEffect(() => {
    const section = location.hash.slice(1)
    if (!section) return
    const match = pageNames
      .flatMap((page) => guidePages[page].steps.map((step) => ({ page, step })))
      .find(({ step }) => step.documentationSection === section)
    window.requestAnimationFrame(() => {
      if (match) setOpenSections((current) => ({ ...current, [match.page]: [match.step.id] }))
      window.requestAnimationFrame(() =>
        document.getElementById(section)?.scrollIntoView({ block: "start" })
      )
    })
  }, [location.hash])

  return (
    <main
      ref={scrollContainerRef}
      className="h-[calc(100dvh-4rem)] overflow-y-auto scroll-smooth"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-8 md:self-start">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5" />
            <h1 className="text-lg font-semibold">{t("documentation")}</h1>
          </div>
          <nav
            className="mt-5 space-y-4"
            aria-label={t("documentationToc")}
          >
            <a
              className={tocClassName("overview")}
              href="#overview"
              aria-current={activeSection === "overview" ? "location" : undefined}
            >
              {t("handbookTitle")}
            </a>
            {pageNames.map((page) => (
              <div key={page}>
                <a
                  className={tocClassName(page)}
                  href={`#${page}`}
                  aria-current={activeSection === page ? "location" : undefined}
                >
                  {t(guidePages[page].labelKey)}
                </a>
                <ul className="mt-1 space-y-1 pl-3">
                  {guidePages[page].steps.map((step) => (
                    <li key={step.id}>
                      <a
                        className={tocClassName(step.documentationSection, true)}
                        href={`#${step.documentationSection}`}
                        aria-current={
                          activeSection === step.documentationSection ? "location" : undefined
                        }
                        onClick={() =>
                          setOpenSections((current) => ({ ...current, [page]: [step.id] }))
                        }
                      >
                        {t(step.titleKey)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <a
            className={cn("mt-4", tocClassName("dialogs"))}
            href="#dialogs"
            aria-current={activeSection === "dialogs" ? "location" : undefined}
          >
            {t("documentationDialogs")}
          </a>
          <a
            className={cn("mt-2", tocClassName("keyboard"))}
            href="#keyboard"
            aria-current={activeSection === "keyboard" ? "location" : undefined}
          >
            {t("documentationKeyboardTitle")}
          </a>
        </aside>
        <div className="min-w-0 space-y-10">
          <header
            id="overview"
            className="scroll-mt-6 border-b pb-6"
          >
            <h2 className="text-3xl font-semibold tracking-tight">{t("handbookTitle")}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              {t("documentationIntro")}
            </p>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {t("documentationWorkflowIntro")}
            </p>
            <p className="mt-4 max-w-3xl border border-amber-500/40 bg-panel p-3 text-sm leading-6">
              {t("mswLoadingNote")}
            </p>
          </header>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="border bg-panel p-4">
              <h2 className="font-semibold">{t("documentationStateTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("documentationStateDescription")}
              </p>
            </div>
            <div className="border bg-panel p-4">
              <h2 className="font-semibold">{t("documentationRulesTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("documentationRulesDescription")}
              </p>
            </div>
            <div className="border bg-panel p-4 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-primary" />
                <h2 className="font-semibold">{t("documentationTimelineTitle")}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("documentationTimelineDescription")}
              </p>
            </div>
          </section>
          {pageNames.map((page) => {
            const definition = guidePages[page]
            const Icon = pageIcons[page]

            return (
              <section
                id={page}
                key={page}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold">{t(definition.labelKey)}</h2>
                    <p className="text-sm text-muted-foreground">
                      {t("documentedFeatures", { count: definition.steps.length })}
                    </p>
                  </div>
                </div>
                <Accordion
                  className="mt-5 border bg-panel px-4"
                  hiddenUntilFound
                  value={openSections[page]}
                  onValueChange={(value) =>
                    setOpenSections((current) => ({ ...current, [page]: value }))
                  }
                >
                  {definition.steps.map((step) => (
                    <AccordionItem
                      id={step.documentationSection}
                      key={step.id}
                      value={step.id}
                      className="scroll-mt-24"
                    >
                      <AccordionTrigger>{t(step.titleKey)}</AccordionTrigger>
                      <AccordionContent className="leading-5 text-muted-foreground">
                        <p>{t(step.descriptionKey)}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link
                              to={`${definition.path}?guide=${page}&guideStep=${step.id}&returnDoc=${step.documentationSection}`}
                            />
                          }
                        >
                          {t("openGuideStep")}
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )
          })}
          <section
            id="dialogs"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("documentationDialogs")}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("documentationDialogsIntro")}
            </p>
            <Accordion
              className="mt-5 border bg-panel px-4"
              hiddenUntilFound
            >
              {modalTopics.map(([id, titleKey, descriptionKey, guideHref]) => (
                <AccordionItem
                  key={id}
                  value={id}
                >
                  <AccordionTrigger>{t(titleKey)}</AccordionTrigger>
                  <AccordionContent className="leading-5 text-muted-foreground">
                    <p>{t(descriptionKey)}</p>
                    <Button
                      className="mt-3"
                      size="sm"
                      variant="outline"
                      disabled={id === "editing" && !editableBooking}
                      render={
                        <Link
                          to={
                            id === "editing" && editableBooking
                              ? `${PATHS.schedule}?week=${appDateKey(editableBooking.startAt)}&booking=${editableBooking.id}&modalGuide=edit-booking&returnDoc=dialogs`
                              : guideHref
                          }
                        />
                      }
                    >
                      {t("openGuideStep")}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
          <section
            id="keyboard"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("documentationKeyboardTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("documentationKeyboardIntro")}
            </p>
            <div className="mt-5 border bg-panel text-sm">
              <dl className="grid items-center gap-3 p-4 sm:grid-cols-[7rem_1fr]">
                <dt>
                  <Kbd>Esc</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardEscape")}</dd>
                <dt>
                  <KbdGroup>
                    <Kbd>Shift</Kbd>
                    <span>+</span>
                    <Kbd>?</Kbd>
                  </KbdGroup>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardGuide")}</dd>
                <dt>
                  <Kbd>/</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardSearch")}</dd>
                <dt>
                  <Kbd>T</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardToday")}</dd>
                <dt>
                  <Kbd>F</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardFilters")}</dd>
                <dt>
                  <Kbd>M</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardMine")}</dd>
                <dt>
                  <Kbd>[</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardPrevious")}</dd>
                <dt>
                  <Kbd>]</Kbd>
                </dt>
                <dd className="text-muted-foreground">{t("documentationKeyboardNext")}</dd>
              </dl>
              <dl className="grid items-center gap-3 border-t p-4 sm:grid-cols-[7rem_1fr]">
                {navigationShortcuts.map(([key, pageKey]) => (
                  <div
                    key={key}
                    className="contents"
                  >
                    <dt>
                      <KbdGroup>
                        <Kbd>Alt</Kbd>
                        <span>+</span>
                        <Kbd>{key}</Kbd>
                      </KbdGroup>
                    </dt>
                    <dd className="text-muted-foreground">
                      {t("documentationKeyboardOpenPage", { page: t(pageKey) })}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default DocumentationPage
