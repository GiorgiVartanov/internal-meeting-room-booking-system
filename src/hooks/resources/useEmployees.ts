import { useQuery } from "@tanstack/react-query"

import { getEmployees } from "@/api"

export const useEmployees = () =>
  useQuery({ queryKey: ["employees"], queryFn: getEmployees, staleTime: Infinity })
