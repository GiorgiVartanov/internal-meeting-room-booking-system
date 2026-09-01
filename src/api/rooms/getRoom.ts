import { get } from "@/api/api"
import type { IRoom, TRoomId } from "@/types"
import { PATHS } from "@/constants"

export const getRoom = (roomId: TRoomId) => get<IRoom>(PATHS.api.room(roomId))
