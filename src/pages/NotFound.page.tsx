import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

/** Provides navigation recovery when no application route matches. */
const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("pageNotFound")}</h1>
        <p className="mt-4 text-muted-foreground">{t("pageNotFoundDescription")}</p>
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

export default NotFoundPage
