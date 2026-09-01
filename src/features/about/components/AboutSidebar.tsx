import { Code2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

interface IProps {
  activeSection: string
}

const links = [
  ["product", "aboutProduct"],
  ["capabilities", "aboutPages"],
  ["architecture", "aboutArchitecture"],
  ["principles", "aboutDecisions"],
  ["models", "aboutDomainModelsTitle"],
  ["testing", "aboutTestingTitle"],
  ["technologies", "aboutTechnologies"],
  ["codex", "aboutCodexTitle"],
] as const

/** Provides in-page navigation for the About documentation sections. */
export const AboutSidebar = ({ activeSection }: IProps) => {
  const { t } = useTranslation()

  return (
    <aside className="md:sticky md:top-8 md:self-start">
      <div className="flex items-center gap-2">
        <Code2 className="size-5" />
        <h1 className="text-lg font-semibold">{t("aboutTitle")}</h1>
      </div>
      <nav
        className="mt-5 space-y-1 text-sm"
        aria-label={t("aboutContents")}
      >
        {links.map(([sectionId, label]) => (
          <a
            key={sectionId}
            className={cn(
              "block border-l-2 py-0.5 pl-3 transition-colors hover:text-primary",
              activeSection === sectionId
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-muted-foreground"
            )}
            href={`#${sectionId}`}
          >
            {t(label)}
          </a>
        ))}
      </nav>
    </aside>
  )
}
