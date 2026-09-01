import { Trans } from "react-i18next"

import type { ReactElement } from "react"

interface IProps {
  translationKey: string
}

/** Renders About copy with distinct source-path and TypeScript-type tokens. */
export const AboutRichText = ({ translationKey }: IProps): ReactElement => (
  <Trans
    i18nKey={translationKey}
    components={{
      path: (
        <code className="mx-0.5 bg-muted px-1 py-0.5 font-mono text-[0.85em] text-[#001080] dark:text-[#9cdcfe]" />
      ),
      type: <code className="font-mono text-[0.9em] text-[#267f99] dark:text-[#4ec9b0]" />,
    }}
  />
)
