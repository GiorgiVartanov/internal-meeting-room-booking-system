import { ExternalLink, FlaskConical } from "lucide-react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AboutDataModelsSection,
  AboutProductHeader,
  AboutRichText,
  AboutSidebar,
  CodexDevelopmentSection,
  aboutSectionIds,
  architectureTopics,
  capabilities,
  principles,
  technologies,
  testSuites,
} from "@/features/about"
import { useActiveSection } from "@/hooks"

/** Presents product architecture, technology, and development information. */
const AboutPage = () => {
  const { t } = useTranslation()
  const scrollContainerRef = useRef<HTMLElement>(null)
  const activeSection = useActiveSection(scrollContainerRef, aboutSectionIds)

  return (
    <main
      ref={scrollContainerRef}
      className="h-[calc(100dvh-4rem)] overflow-y-auto scroll-smooth"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <AboutSidebar activeSection={activeSection} />

        <div className="min-w-0 space-y-12">
          <AboutProductHeader />

          <section
            id="capabilities"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("aboutPages")}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{t("aboutPagesIntro")}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {capabilities.map(([Icon, titleKey, descriptionKey]) => (
                <article
                  key={titleKey}
                  className="border bg-background p-5"
                >
                  <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(descriptionKey)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="architecture"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("aboutArchitecture")}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {t("aboutDataModelIntro")}
            </p>
            <Accordion className="mt-5 border bg-background px-4">
              {architectureTopics.map(([titleKey, descriptionKey]) => (
                <AccordionItem
                  key={titleKey}
                  value={titleKey}
                >
                  <AccordionTrigger>{t(titleKey)}</AccordionTrigger>
                  <AccordionContent className="leading-5 text-muted-foreground">
                    <AboutRichText translationKey={descriptionKey} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section
            id="principles"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("aboutDecisions")}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {t("aboutDecisionsIntro")}
            </p>
            <Accordion className="mt-5 border bg-background px-4">
              {principles.map(([id, titleKey, descriptionKey]) => (
                <AccordionItem
                  key={id}
                  value={id}
                >
                  <AccordionTrigger>{t(titleKey)}</AccordionTrigger>
                  <AccordionContent className="leading-5 text-muted-foreground">
                    <AboutRichText translationKey={descriptionKey} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <AboutDataModelsSection />

          <section
            id="testing"
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
                <FlaskConical className="size-5" />
              </span>
              <h2 className="text-2xl font-semibold">{t("aboutTestingTitle")}</h2>
            </div>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {t("aboutTestingDescription")}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {testSuites.map(([titleKey, descriptionKey, count]) => (
                <article
                  key={titleKey}
                  className="border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{t(titleKey)}</h3>
                    <code className="shrink-0 bg-muted px-1.5 py-0.5 text-xs text-primary">
                      {count} {t("aboutTestsLabel")}
                    </code>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(descriptionKey)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="technologies"
            className="scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold">{t("aboutTechnologies")}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
              {t("aboutTechnologyIntro")}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {technologies.map(([name, href, useKey]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group border bg-background p-3 transition-colors hover:border-primary/70 hover:bg-accent/70"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <strong>{name}</strong>
                    </span>
                    <ExternalLink className="size-4 shrink-0" />
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground group-hover:text-foreground">
                    {t(useKey)}
                  </span>
                </a>
              ))}
            </div>
          </section>
          <CodexDevelopmentSection />
        </div>
      </div>
    </main>
  )
}

export default AboutPage
