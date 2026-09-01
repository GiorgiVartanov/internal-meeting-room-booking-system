import { useTranslation } from "react-i18next"

import { getApiErrorMessage } from "@/api/api"

interface IProps {
  error: unknown
  fallback?: string
}

export const ApiErrorAlert = ({ error, fallback }: IProps) => {
  const { t } = useTranslation()

  return (
    <p
      role="alert"
      className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      {getApiErrorMessage(error, fallback ?? t("requestFailed"))}
    </p>
  )
}
