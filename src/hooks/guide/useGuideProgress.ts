import { useQuery } from "@tanstack/react-query"

import { getGuideProgress } from "@/api"

export const guideProgressKey = ["guide-progress"] as const

export const useGuideProgress = () =>
  useQuery({ queryKey: guideProgressKey, queryFn: getGuideProgress, staleTime: Infinity })
