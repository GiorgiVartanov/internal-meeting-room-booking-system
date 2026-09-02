import { get } from "@/api/api"
import type { IBookingDayActivity, IEmployee, IHoliday } from "@/types"
import { PATHS } from "@/constants"

const collection = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray(Reflect.get(value, "items")))
    return Reflect.get(value, "items") as T[]

  return []
}

export const getHolidays = async () => collection<IHoliday>(await get<unknown>(PATHS.api.holidays))

export const getEmployees = async () => collection<IEmployee>(await get<unknown>(PATHS.api.employees))

export const getBookingActivity = async ({
  organizerId,
  participantId,
}: { organizerId?: string; participantId?: string } = {}) =>
  collection<IBookingDayActivity>(
    await get<unknown>(PATHS.api.bookingActivity, { params: { organizerId, participantId } })
  )
