import { format } from "date-fns"
import { enUS, ka } from "date-fns/locale"

import { APP_TIME_ZONE } from "@/constants"

const appDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const appClockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export const dateLocale = (language: string) => (language === "ka" ? ka : enUS)
export const nativeDateLocale = (language: string) => (language === "ka" ? "ka-GE" : "en-GB")
export const dateKey = (date: Date) => format(date, "yyyy-MM-dd")
export const appDateKey = (value: string | Date) =>
  appDateKeyFormatter.format(typeof value === "string" ? new Date(value) : value)
export const appCalendarDate = (value: string | Date = new Date()) =>
  new Date(`${appDateKey(value)}T12:00:00`)
export const appClockMinutes = (value: string | Date) => {
  const parts = appClockFormatter.formatToParts(typeof value === "string" ? new Date(value) : value)

  const read = (type: "hour" | "minute") =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return read("hour") * 60 + read("minute")
}
export const fromDateAndTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00+04:00`).toISOString()
export const formatAppTime = (value: string, language: string) =>
  new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-GB", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
export const formatAppDate = (
  value: string | Date,
  language: string,
  options?: Intl.DateTimeFormatOptions
) =>
  new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : "en-GB", {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(typeof value === "string" ? new Date(value) : value)
