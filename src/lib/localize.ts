import type { ILocalizedText, TLanguage } from "@/types"

export const localize = (value: string | ILocalizedText | undefined, language: string) => {
  if (!value) return ""
  if (typeof value === "string") return value

  return language === "ka" ? (value.ka ?? value.en) : value.en
}

export const supportedLanguage = (value: string): TLanguage => (value === "ka" ? "ka" : "en")
