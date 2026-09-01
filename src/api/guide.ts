import { get, patch } from "@/api/api"
import type { IGuideProgress, IUpdateGuideProgressInput } from "@/types"
import { PATHS } from "@/constants"

export const getGuideProgress = () => get<IGuideProgress>(PATHS.api.guideProgress)

export const updateGuideProgress = (input: IUpdateGuideProgressInput) =>
  patch<IGuideProgress, IUpdateGuideProgressInput>(PATHS.api.guideProgress, input)
