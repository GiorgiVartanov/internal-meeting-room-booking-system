import { CalendarDays } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { PATHS } from "@/constants"

/** Introduces the product and summarizes its core capabilities. */
export const AboutProductHeader = () => {
  const { t } = useTranslation()

  return (
    <header
      id="product"
      className="scroll-mt-6 border-b pb-8"
    >
      <div className="flex size-12 items-center justify-center bg-primary/10 text-primary">
        <CalendarDays className="size-6" />
      </div>
      <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">{t("aboutSubtitle")}</h2>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{t("aboutDescription")}</p>
      <Button
        className="mt-6"
        variant="outline"
        render={<Link to={PATHS.documentation} />}
      >
        {t("documentation")}
      </Button>
    </header>
  )
}
