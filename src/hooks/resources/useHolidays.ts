import { useQuery } from "@tanstack/react-query"

import { getHolidays } from "@/api"

export const useHolidays = () =>
  useQuery({ queryKey: ["holidays"], queryFn: getHolidays, staleTime: Infinity })
