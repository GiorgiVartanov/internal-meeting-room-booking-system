import { useCallback, useEffect, useRef } from "react"

import { UI_DEBOUNCE_MILLISECONDS } from "@/constants"

export const useDebouncedCallback = <TArguments extends unknown[]>(
  callback: (...arguments_: TArguments) => void,
  delay = UI_DEBOUNCE_MILLISECONDS
) => {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(
    () => () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    },
    []
  )

  return useCallback(
    (...arguments_: TArguments) => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => callbackRef.current(...arguments_), delay)
    },
    [delay]
  )
}
