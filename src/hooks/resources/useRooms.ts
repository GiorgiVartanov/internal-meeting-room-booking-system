import { useQuery } from "@tanstack/react-query"

import { getRooms } from "@/api"
import type { IRoomFilters, TRoomId } from "@/types"

export const roomKeys = {
  all: ["rooms"] as const,
  list: (filters: IRoomFilters) => ["rooms", filters] as const,
  detail: (id: TRoomId) => ["rooms", id] as const,
}
export const useRooms = (filters: IRoomFilters = {}) =>
  useQuery({ queryKey: roomKeys.list(filters), queryFn: () => getRooms(filters) })
