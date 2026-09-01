import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateGuideProgress } from "@/api"

import { guideProgressKey } from "./useGuideProgress"

export const useUpdateGuideProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGuideProgress,
    onSuccess: (progress) => queryClient.setQueryData(guideProgressKey, progress),
  })
}
