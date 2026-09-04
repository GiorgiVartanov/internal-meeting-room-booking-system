import { useTranslation } from "react-i18next"

interface IProps {
  error: unknown
}

/** Shows a visible failure instead of a blank page when application bootstrapping fails. */
export const ApplicationStartupError = ({ error }: IProps) => {
  const { t } = useTranslation()

  const message = error instanceof Error ? error.message : t("unexpectedError")

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section
        aria-labelledby="startup-error-title"
        className="max-w-lg border bg-card p-6 shadow-sm"
      >
        <h1
          id="startup-error-title"
          className="text-lg font-semibold"
        >
          {t("unexpectedError")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("startupMswDescription")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t("startupRetryDescription")}</p>
        <p
          role="alert"
          className="mt-4 break-words border-l-2 border-destructive pl-3 font-mono text-xs text-muted-foreground"
        >
          {message}
        </p>
      </section>
    </main>
  )
}
