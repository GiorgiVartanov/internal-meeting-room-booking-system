import { useQueryClient } from "@tanstack/react-query"
import { isWeekend, nextMonday, startOfWeek } from "date-fns"
import { CalendarDays, CalendarRange, CircleHelp, Languages, Moon, Sun, Rows3 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, useLocation, useNavigation } from "react-router-dom"

import { getHolidays, getRooms } from "@/api"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"
import { useGuide } from "@/features/guide"
import {
  employeeWeekBookingParams,
  prefetchEmployeeBookingPages,
  roomKeys,
  useAppShortcuts,
  useEmployees,
} from "@/hooks"
import { localize } from "@/lib/localize"
import { appCalendarDate, nativeDateLocale } from "@/lib/date"

type TTheme = "light" | "dark"

const preloadPage = (path: string): Promise<unknown> => {
  if (path === PATHS.schedule) return import("@/pages/Schedule.page")
  if (path === PATHS.dashboard) return import("@/pages/Dashboard.page")
  if (path === PATHS.documentation) return import("@/pages/Documentation.page")
  if (path === PATHS.about) return import("@/pages/About.page")

  return import("@/pages/Home.page")
}

const initialTheme = (): TTheme => {
  const saved = localStorage.getItem("meeting-room-theme")
  if (saved === "light" || saved === "dark") return saved

  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const AppHeader = () => {
  const { t, i18n } = useTranslation()
  const [theme, setTheme] = useState<TTheme>(initialTheme)
  const location = useLocation()
  const navigation = useNavigation()
  const employees = useEmployees()
  const queryClient = useQueryClient()
  const { openGuide } = useGuide()

  const visiblePath = navigation.location?.pathname ?? location.pathname
  const documentationActive = visiblePath === PATHS.documentation
  const guideUnavailable = visiblePath === PATHS.about || documentationActive
  const primaryNavigationActive =
    visiblePath === PATHS.home ||
    visiblePath.startsWith(PATHS.schedule) ||
    visiblePath.startsWith(PATHS.dashboard)

  const currentEmployee = employees.data?.find((employee) => employee.id === DEFAULT_EMPLOYEE_ID)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.style.colorScheme = theme
    localStorage.setItem("meeting-room-theme", theme)
  }, [theme])

  const prefetchSchedule = useCallback(() => {
    const today = appCalendarDate()
    const weekStart = isWeekend(today) ? nextMonday(today) : startOfWeek(today, { weekStartsOn: 1 })

    return Promise.all([
      prefetchEmployeeBookingPages(
        queryClient,
        employeeWeekBookingParams(DEFAULT_EMPLOYEE_ID, weekStart)
      ),
      queryClient
        .query({ queryKey: roomKeys.list({}), queryFn: () => getRooms({}) })
        .catch(() => undefined),
      queryClient
        .query({ queryKey: ["holidays"], queryFn: getHolidays })
        .catch(() => undefined),
    ])
  }, [queryClient])

  useEffect(() => {
    void prefetchSchedule()
  }, [prefetchSchedule])

  useAppShortcuts({ guideUnavailable, openGuide })

  const setLanguage = (language: string | null) => {
    if (language !== "en" && language !== "ka") return
    localStorage.setItem("meeting-room-booking-website", language)
    document.documentElement.lang = nativeDateLocale(language)
    void i18n.changeLanguage(language)
  }

  const openGuideIfAvailable = (): void => {
    if (!documentationActive) openGuide()
  }

  return (
    <header className="sticky top-0 z-[60] border-b bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 w-full min-w-0 items-center gap-1 p-2 sm:gap-2">
        <div className="mr-auto flex min-w-0 items-center gap-2 font-semibold tracking-tight">
          <Link
            data-header-obscured
            to={PATHS.home}
            aria-label={t("appName")}
          >
            <span className="line-clamp-2 max-w-24 text-[11px] leading-tight min-[390px]:max-w-40 min-[390px]:text-xs sm:max-w-none sm:text-sm">
              {t("appName")}
            </span>
          </Link>
          {currentEmployee && (
            <a
              href="https://github.com/GiorgiVartanov/internal-meeting-room-booking-system"
              target="_blank"
              rel="noreferrer"
              className="hidden border-l pl-3 text-xs font-normal text-muted-foreground hover:text-foreground md:inline"
            >
              {localize(currentEmployee.name, i18n.language)}
            </a>
          )}
        </div>
        <nav
          data-header-obscured
          data-guide="primary-navigation"
          className="relative grid grid-cols-3 items-center"
          aria-label={t("primaryNavigation")}
        >
          {[
            { to: PATHS.home, label: t("bookingNav"), icon: Rows3 },
            { to: PATHS.schedule, label: t("schedule"), icon: CalendarRange },
            { to: PATHS.dashboard, label: t("dashboard"), icon: CalendarDays },
          ].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              aria-label={label}
              onPointerEnter={() => {
                void preloadPage(to)
                if (to === PATHS.schedule) void prefetchSchedule()
              }}
              onFocus={() => {
                void preloadPage(to)
                if (to === PATHS.schedule) void prefetchSchedule()
              }}
              className={({ isActive, isPending }) => {
                const active = isPending || (!navigation.location && isActive)

                return cn(
                  "flex h-9 items-center justify-center gap-2 px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3",
                  active && "text-foreground"
                )
              }}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 h-0.5 w-1/3 bg-primary transition-transform duration-300 ease-out",
              !primaryNavigationActive && "opacity-0",
              visiblePath.startsWith(PATHS.schedule) && "translate-x-full",
              visiblePath.startsWith(PATHS.dashboard) && "translate-x-[200%]"
            )}
          />
        </nav>
        <Button
          data-header-obscured
          variant={documentationActive ? "default" : "outline"}
          size="icon"
          aria-label={t("guideOpen")}
          aria-current={documentationActive ? "page" : undefined}
          disabled={visiblePath === PATHS.about}
          onPointerEnter={() => void preloadPage(PATHS.documentation)}
          onFocus={() => void preloadPage(PATHS.documentation)}
          onClick={openGuideIfAvailable}
        >
          <CircleHelp className="size-4" />
        </Button>
        <div
          data-dialog-dismiss-protected
          className="relative z-[60] flex items-center gap-1 sm:gap-2"
        >
          <Select
            value={i18n.language.startsWith("ka") ? "ka" : "en"}
            onValueChange={setLanguage}
          >
            <SelectTrigger
              data-dialog-dismiss-protected
              className="w-14 min-[390px]:w-20"
              aria-label={t("language")}
            >
              <Languages className="hidden size-4 min-[390px]:block" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              data-dialog-dismiss-protected
              className="min-w-20"
            >
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ka">KA</SelectItem>
            </SelectContent>
          </Select>
          <Button
            data-dialog-dismiss-protected
            variant="outline"
            size="icon"
            aria-label={`${t("theme")}: ${theme === "dark" ? t("light") : t("dark")}`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
