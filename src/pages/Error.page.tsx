import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

/** Displays a recoverable route-level error state. */
const ErrorPage = () => {
  const error = useRouteError()
  const { t } = useTranslation()

  let message = t("unexpectedError")
  if (error instanceof Error) message = error.message
  if (isRouteErrorResponse(error)) message = error.statusText || t("routeLoadFailed")

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-medium text-destructive">{t("somethingWentWrong")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("couldNotLoadPage")}</h1>
        <p
          role="alert"
          className="mt-4 text-muted-foreground"
        >
          {message}
        </p>
        <Button
          className="mt-6"
          render={<Link to="/" />}
        >
          {t("returnHome")}
        </Button>
      </section>
    </main>
  )
}

export default ErrorPage
