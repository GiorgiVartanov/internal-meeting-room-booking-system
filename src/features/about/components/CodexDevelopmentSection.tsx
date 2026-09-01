import { Bot, ExternalLink, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

const modelRoles = [
  ["GPT-5.6 Sol", "aboutCodexSolRole", "https://developers.openai.com/api/docs/models/gpt-5.6-sol"],
  [
    "GPT-5.6 Terra",
    "aboutCodexTerraRole",
    "https://developers.openai.com/api/docs/models/gpt-5.6-terra",
  ],
  [
    "GPT-5.6 Luna",
    "aboutCodexLunaRole",
    "https://developers.openai.com/api/docs/models/gpt-5.6-luna",
  ],
] as const

const challengeKeys = [
  ["aboutCodexCalendarChallengeTitle", "aboutCodexCalendarChallengeDescription"],
  ["aboutCodexAnyRoomChallengeTitle", "aboutCodexAnyRoomChallengeDescription"],
  ["aboutCodexResponsiveChallengeTitle", "aboutCodexResponsiveChallengeDescription"],
  ["aboutCodexUrlChallengeTitle", "aboutCodexUrlChallengeDescription"],
  ["aboutCodexRulesChallengeTitle", "aboutCodexRulesChallengeDescription"],
  ["aboutCodexPolishChallengeTitle", "aboutCodexPolishChallengeDescription"],
] as const

/** Describes how Codex contributed to the application's development workflow. */
export const CodexDevelopmentSection = () => {
  const { t } = useTranslation()

  return (
    <section
      id="codex"
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
          <Bot className="size-5" />
        </span>
        <h2 className="text-2xl font-semibold">{t("aboutCodexTitle")}</h2>
      </div>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{t("aboutCodexDescription")}</p>
      <p className="mt-3 max-w-3xl border border-primary/30 bg-background p-3 text-sm leading-6">
        {t("aboutCodexOwnership")}
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {modelRoles.map(([model, roleKey, href]) => (
          <article
            key={model}
            className="flex h-full flex-col border bg-background p-4"
          >
            <h3 className="font-semibold text-primary">{model}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(roleKey)}</p>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-primary hover:underline"
            >
              {t("aboutCodexModelLink", { model })}
              <ExternalLink className="size-4" />
            </a>
          </article>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <UserRound className="size-5 text-primary" />
        <h3 className="text-lg font-semibold">{t("aboutCodexChallengesTitle")}</h3>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {t("aboutCodexChallengesDescription")}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {challengeKeys.map(([titleKey, descriptionKey]) => (
          <article
            key={titleKey}
            className="border border-primary/30 bg-background p-4"
          >
            <h4 className="font-semibold">{t(titleKey)}</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(descriptionKey)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
