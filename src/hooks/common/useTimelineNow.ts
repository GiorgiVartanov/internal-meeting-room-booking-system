import { useEffect, useState } from "react"

import { TIMELINE_NOW_UPDATE_MILLISECONDS } from "@/constants"

export const useTimelineNow = (): Date => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: number | undefined
    const millisecondsUntilNextMinute =
      TIMELINE_NOW_UPDATE_MILLISECONDS - (Date.now() % TIMELINE_NOW_UPDATE_MILLISECONDS)
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), TIMELINE_NOW_UPDATE_MILLISECONDS)
    }, millisecondsUntilNextMinute)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  return now
}
