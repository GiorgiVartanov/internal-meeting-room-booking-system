import {
  addBusinessDays,
  addWeeks,
  isValid,
  parseISO,
  startOfWeek,
} from "date-fns"
import { useEffect } from "react"
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom"

import { PATHS } from "@/constants"
import { appCalendarDate, dateKey } from "@/lib/date"

interface IOptions {
  guideUnavailable: boolean
  openGuide: () => void
}

const routeShortcuts: Record<string, string> = {
  "1": PATHS.home,
  "2": PATHS.schedule,
  "3": PATHS.dashboard,
  "4": PATHS.documentation,
  "5": PATHS.about,
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.matches("input, textarea, select"))

const hasOpenOverlay = (): boolean =>
  Boolean(document.querySelector('[data-slot="dialog-content"], [data-slot="drawer-popup"]'))

const toggleSearchParam = (params: URLSearchParams, name: string): void => {
  if (params.get(name) === "true") params.delete(name)
  else params.set(name, "true")
}

interface IShortcutContext {
  event: KeyboardEvent
  pathname: string
  params: URLSearchParams
  navigate: NavigateFunction
  guideUnavailable: boolean
  openGuide: () => void
}

const navigateWithParams = (
  navigate: NavigateFunction,
  pathname: string,
  params: URLSearchParams
): void => {
  void navigate({ pathname, search: params.toString() })
}

const openBookingHistory = ({ event, pathname, params, navigate }: IShortcutContext): void => {
  event.preventDefault()
  const next = pathname === PATHS.home ? params : new URLSearchParams()
  next.set("history", "open")
  void navigate({ pathname: PATHS.home, search: next.toString() })
}

const resetCurrentPeriod = ({ event, pathname, params, navigate }: IShortcutContext): void => {
  if (pathname === PATHS.schedule) params.delete("week")
  else if (pathname === PATHS.home || pathname === PATHS.dashboard) params.delete("date")
  else return
  event.preventDefault()
  navigateWithParams(navigate, pathname, params)
}

const openRoomFilters = ({ event, pathname }: IShortcutContext): void => {
  if (pathname !== PATHS.home) return
  event.preventDefault()
  window.dispatchEvent(new Event("meeting-room:open-filters"))
}

const toggleMyBookings = ({ event, pathname, params, navigate }: IShortcutContext): void => {
  if (pathname === PATHS.home) {
    params.set("history", "open")
    toggleSearchParam(params, "historyMine")
  } else if (pathname === PATHS.dashboard) toggleSearchParam(params, "dayMine")
  else return
  event.preventDefault()
  navigateWithParams(navigate, pathname, params)
}

const changeVisiblePeriod = ({ event, pathname, params, navigate }: IShortcutContext): void => {
  const direction = event.key === "[" ? -1 : 1
  if (pathname === PATHS.schedule) {
    const requested = parseISO(params.get("week") ?? "")
    const current = isValid(requested)
      ? startOfWeek(requested, { weekStartsOn: 1 })
      : startOfWeek(appCalendarDate(), { weekStartsOn: 1 })
    params.set("week", dateKey(addWeeks(current, direction)))
  } else if (pathname === PATHS.home || pathname === PATHS.dashboard) {
    const requested = parseISO(params.get("date") ?? "")
    params.set(
      "date",
      dateKey(addBusinessDays(isValid(requested) ? requested : appCalendarDate(), direction))
    )
  } else return
  event.preventDefault()
  navigateWithParams(navigate, pathname, params)
}

const openPageGuide = ({ event, guideUnavailable, openGuide }: IShortcutContext): void => {
  if (!event.shiftKey || guideUnavailable) return
  event.preventDefault()
  openGuide()
}

const handlePageShortcut = (context: IShortcutContext): void => {
  switch (context.event.key.toLowerCase()) {
    case "/":
      openBookingHistory(context)
      break
    case "t":
      resetCurrentPeriod(context)
      break
    case "f":
      openRoomFilters(context)
      break
    case "m":
      toggleMyBookings(context)
      break
    case "[":
    case "]":
      changeVisiblePeriod(context)
      break
    case "?":
      openPageGuide(context)
  }
}

export const useAppShortcuts = ({ guideUnavailable, openGuide }: IOptions): void => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent): void => {
      if (isTyping(event.target) || hasOpenOverlay()) return

      const route = event.altKey ? routeShortcuts[event.key] : undefined
      if (route) {
        event.preventDefault()
        void navigate(route)

        return
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return

      handlePageShortcut({
        event,
        pathname: location.pathname,
        params: new URLSearchParams(location.search),
        navigate,
        guideUnavailable,
        openGuide,
      })
    }

    window.addEventListener("keydown", handleShortcut)

    return () => window.removeEventListener("keydown", handleShortcut)
  }, [guideUnavailable, location.pathname, location.search, navigate, openGuide])
}
