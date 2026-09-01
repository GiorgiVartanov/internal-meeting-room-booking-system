import { addDays, format } from "date-fns"

import type { IHoliday, ILocalizedText } from "@/types"

interface IHolidayRule {
  id: string
  monthDay?: string
  easterOffsetDays?: number
  name: ILocalizedText
}

const orthodoxEaster = (year: number): Date => {
  const remainder4 = year % 4
  const remainder7 = year % 7
  const remainder19 = year % 19
  const moonOffset = (19 * remainder19 + 15) % 30
  const weekOffset = (2 * remainder4 + 4 * remainder7 - moonOffset + 34) % 7
  const julianValue = moonOffset + weekOffset + 114
  const julianMonth = Math.floor(julianValue / 31)
  const julianDay = (julianValue % 31) + 1

  // The Julian calendar is 13 days behind Gregorian for the supported app years.
  return addDays(new Date(Date.UTC(year, julianMonth - 1, julianDay)), 13)
}

export const expandGeorgianHolidayRules = (
  rules: IHolidayRule[],
  firstYear: number,
  lastYear: number
): IHoliday[] => {
  const holidays: IHoliday[] = []
  for (let year = firstYear; year <= lastYear; year += 1) {
    const easter = orthodoxEaster(year)
    rules.forEach((rule) => {
      const date = rule.monthDay
        ? `${year}-${rule.monthDay}`
        : format(addDays(easter, rule.easterOffsetDays ?? 0), "yyyy-MM-dd")
      holidays.push({ date, name: rule.name, countryCode: "GE" })
    })
  }

  return holidays.sort((first, second) => first.date.localeCompare(second.date))
}
