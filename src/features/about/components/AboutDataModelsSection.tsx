import { Database } from "lucide-react"
import { useTranslation } from "react-i18next"

import { dataModels } from "../data/aboutContent"

import { DataTypeTokens } from "./DataTypeTokens"

/** Explains the application's primary domain models and their fields. */
export const AboutDataModelsSection = () => {
  const { t } = useTranslation()

  return (
    <section
      id="models"
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center bg-primary/10 text-primary">
          <Database className="size-5" />
        </span>
        <h2 className="text-2xl font-semibold">{t("aboutDomainModelsTitle")}</h2>
      </div>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
        {t("aboutDomainModelsDescription")}
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {dataModels.map(({ titleKey, descriptionKey, fields }) => (
          <article
            key={titleKey}
            className="border bg-background p-5"
          >
            <h3 className="font-semibold">{t(titleKey)}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(descriptionKey)}</p>
            <dl className="mt-4 divide-y border bg-background text-xs">
              {fields.map(([name, type]) => (
                <div
                  key={name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-2.5"
                >
                  <dt>
                    <code className="text-foreground">{name}</code>
                  </dt>
                  <dd>
                    <code>
                      <DataTypeTokens type={type} />
                    </code>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
