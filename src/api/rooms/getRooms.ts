import { get } from "@/api/api"
import type { IRoom, IRoomFilters } from "@/types"
import { PATHS } from "@/constants"

export const getRooms = async (filters: IRoomFilters = {}) => {
  const response: unknown = await get<unknown>(PATHS.api.rooms, {
    params: {
      ...filters,
      capacity: filters.capacity?.join(","),
      amenities: filters.amenities?.join(","),
    },
  })

  if (Array.isArray(response)) return response as IRoom[]
  if (response && typeof response === "object" && Array.isArray(Reflect.get(response, "items")))
    return Reflect.get(response, "items") as IRoom[]

  return []
}
