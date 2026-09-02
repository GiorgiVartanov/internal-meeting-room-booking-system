import { useContext } from "react"

import { GuideContext } from "../context"

/** Exposes the active project-guide state and navigation controls. */
export const useGuide = () => {
  const context = useContext(GuideContext)

  if (!context) throw new Error("useGuide must be used inside GuideProvider.")

  return context
}
