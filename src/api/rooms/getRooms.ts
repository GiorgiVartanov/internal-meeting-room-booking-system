import { get } from "@/api/api"
import type { IRoom, IRoomFilters } from "@/types"
import { PATHS } from "@/constants"

export const getRooms = (filters: IRoomFilters = {}) =>
  get<IRoom[]>(PATHS.api.rooms, {
    params: {
      ...filters,
      capacity: filters.capacity?.join(","),
      amenities: filters.amenities?.join(","),
    },
  })
