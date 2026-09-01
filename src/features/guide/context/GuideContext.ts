import { createContext } from "react"

import type { TGuidePage } from "@/types"

interface IGuideContextValue {
  openGuide: (page?: TGuidePage) => void
}

export const GuideContext = createContext<IGuideContextValue | undefined>(undefined)
