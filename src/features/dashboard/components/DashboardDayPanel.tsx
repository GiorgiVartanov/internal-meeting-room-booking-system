import { differenceInMinutes } from "date-fns"
import { ArrowLeft, ArrowRight, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"
import { RoomCard } from "@/features/rooms"
import { BookingCardActions, BookingTimeRange } from "@/features/schedule"
import { bookingParticipationClassName } from "@/features/schedule/utils"
import { formatAppTime } from "@/lib/date"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IBooking, IEmployee, IRoom } from "@/types"

import { DashboardBookingsTimeline } from "./DashboardBookingsTimeline"

import type { ReactElement } from "react"

export type TDashboardDayTab = "rooms" | "bookings"

export interface IDashboardDayProps {
  date?: Date
  dateValue?: string
  rooms: IRoom[]
  bookings: IBooking[]
  loading?: boolean
  employees: IEmployee[]
  selectedRoom?: IRoom
  activeTab: TDashboardDayTab
  onlyMine: boolean
  mobileOpen?: boolean
  onClose: () => void
  onRoom: (room?: IRoom) => void
  onTab: (tab: TDashboardDayTab) => void
  onBooking: (booking: IBooking) => void
  onEditBooking: (booking: IBooking) => void
}

/** Totals the scheduled duration of a collection of bookings. */
const bookedMinutes = (bookings: IBooking[]): number =>
  bookings.reduce(
    (sum, booking) => sum + differenceInMinutes(new Date(booking.endAt), new Date(booking.startAt)),
    0
  )

/** Summarizes rooms and bookings for the date selected on the dashboard. */
export const DashboardDayPanel = ({
  date,
  dateValue,
  rooms,
  bookings,
  loading,
  employees,
  selectedRoom,
  activeTab,
  onlyMine,
  onRoom,
  onTab,
  onBooking,
  onEditBooking,
}: IDashboardDayProps): ReactElement => {
  const { t, i18n } = useTranslation()

  const roomBookings = (room: IRoom): IBooking[] =>
    bookings.filter((booking) => booking.roomId === room.id)

  const bookedRooms = rooms.filter((room) => roomBookings(room).length > 0)

  const durationLabel = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return (
      [
        hours ? t("durationHoursShort", { count: hours }) : "",
        remainingMinutes ? t("durationMinutesShort", { count: remainingMinutes }) : "",
      ]
        .filter(Boolean)
        .join(" ") || t("durationMinutesShort", { count: 0 })
    )
  }
  const meetingSummary = (items: IBooking[]): string =>
    t("meetingDurationSummary", {
      count: items.length,
      duration: durationLabel(bookedMinutes(items)),
    })
  const visibleBookings = onlyMine
    ? bookings.filter((booking) => booking.organizerId === DEFAULT_EMPLOYEE_ID)
    : bookings

  return (
    <Tabs
      data-guide="dashboard-day-panel"
      value={activeTab}
      onValueChange={(value) => onTab(value as TDashboardDayTab)}
      className="flex h-full min-h-0 min-w-[300px] flex-col bg-panel"
    >
      <header className="border-b p-3">
        <div className="max-w-2xl">
          <h2 className="font-semibold">{t("daySchedule")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {date?.toLocaleDateString(i18n.language === "ka" ? "ka-GE" : "en-GB", {
              dateStyle: "full",
            })}
          </p>
          <TabsList className="mt-3 grid w-full max-w-xl grid-cols-2">
            <TabsIndicator />
            <TabsTrigger
              data-guide="dashboard-rooms-tab"
              className="w-full"
              value="rooms"
            >
              {t("rooms")}
            </TabsTrigger>
            <TabsTrigger
              data-guide="dashboard-bookings-tab"
              className="w-full"
              value="bookings"
            >
              {t("bookings")}
            </TabsTrigger>
          </TabsList>
        </div>
      </header>
      <div
        className="min-h-0 flex-1 overflow-auto bg-panel p-3"
        aria-busy={loading}
      >
        {loading && <span className="sr-only">{t("loading")}</span>}
        {!loading && (
          <>
            <TabsContent value="rooms">
              {selectedRoom ? (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => onRoom()}
                  >
                    <ArrowLeft />
                    {t("bookedRooms")}
                  </Button>
                  <RoomCard
                    room={selectedRoom}
                    compact
                    showImage
                  />
                  <div className="border p-3">
                    <strong>{meetingSummary(roomBookings(selectedRoom))}</strong>
                    {roomBookings(selectedRoom).map((booking) => {
                      const organizer = employees.find(
                        (employee) => employee.id === booking.organizerId
                      )

                      return (
                        <article
                          key={booking.id}
                          className={cn(
                            "relative mt-2 cursor-pointer border p-2 pr-12 text-xs text-muted-foreground outline outline-1 -outline-offset-1 outline-transparent transition-[background-color,outline-color] hover:bg-accent/70 hover:outline-primary focus-within:outline-2 focus-within:outline-primary",
                            bookingParticipationClassName(booking)
                          )}
                        >
                          <button
                            type="button"
                            className="absolute inset-0 z-0"
                            aria-label={localize(booking.title, i18n.language)}
                            onClick={() => onBooking(booking)}
                          />
                          <div className="pointer-events-none relative z-10">
                            <strong className="block truncate text-foreground">
                              {localize(booking.title, i18n.language)}
                            </strong>
                            <BookingTimeRange
                              start={formatAppTime(booking.startAt, i18n.language)}
                              end={formatAppTime(booking.endAt, i18n.language)}
                              className="block truncate"
                            />
                            <span className="mt-1 flex min-w-0 items-center gap-1">
                              <span className="min-w-0 truncate border border-primary/30 bg-primary/10 px-1 text-[10px] font-medium text-primary">
                                {localize(selectedRoom.name, i18n.language)}
                              </span>
                              <span className="flex min-w-0 items-center gap-1 truncate">
                                <UserRound className="size-3 shrink-0" />
                                {organizer
                                  ? localize(organizer.name, i18n.language)
                                  : booking.organizerId}
                              </span>
                            </span>
                          </div>
                          <BookingCardActions
                            booking={booking}
                            onEdit={() => onEditBooking(booking)}
                          />
                        </article>
                      )
                    })}
                  </div>
                  <Button render={<Link to={`${PATHS.room(selectedRoom.id)}&date=${dateValue}`} />}>
                    {t("viewSchedule")}
                    <ArrowRight />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {!bookedRooms.length && (
                    <p className="text-sm text-muted-foreground">{t("noBookings")}</p>
                  )}
                  {bookedRooms.map((room) => {
                    const items = roomBookings(room)

                    return (
                      <button
                        type="button"
                        key={room.id}
                        className="w-full border bg-card p-3 text-left transition-colors hover:border-primary/70 hover:bg-accent/70"
                        onClick={() => onRoom(room)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{localize(room.name, i18n.language)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {t("roomPlaces", { count: room.capacity })}
                            </p>
                          </div>
                          <Badge variant="secondary">{meetingSummary(items)}</Badge>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent value="bookings">
              <DashboardBookingsTimeline
                date={date}
                rooms={rooms}
                bookings={visibleBookings}
                employees={employees}
                onBooking={onBooking}
                onEditBooking={onEditBooking}
              />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  )
}
