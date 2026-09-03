import { Check, Search, UserRound, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { BOOKING_SEARCH_DEBOUNCE_MILLISECONDS, DEFAULT_EMPLOYEE_ID, PATHS } from "@/constants"
import { ModalGuide, ModalGuideQuestionButton } from "@/features/guide"
import { BookingCard, BookingTimeRange } from "@/features/schedule"
import { useDebouncedCallback, useEmployees, useInfiniteBookingSearch, useRooms } from "@/hooks"
import {
  appDateKey,
  formatAppDate,
  formatAppTime,
  fromDateAndTime,
  nativeDateLocale,
} from "@/lib/date"
import { localize } from "@/lib/localize"
import type { TCapacityBucket, TRoomAmenity } from "@/types"

import { BookingSearchFilterCard } from "./BookingSearchFilterCard"
import { FilterButtons } from "./FilterButtons"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
const capacities: TCapacityBucket[] = ["1", "2", "4-8", "9-20"]
const amenities: TRoomAmenity[] = [
  "display",
  "whiteboard",
  "video-conference",
  "speakerphone",
  "standing-desk",
]

/** Searches and filters booking history in a paginated dialog. */
export const BookingSearchDialog = ({ open, onOpenChange }: IProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const rooms = useRooms()
  const employees = useEmployees()

  const query = params.get("historyQuery") ?? ""

  const [search, setSearch] = useState(query)
  const [showGuideOpener, setShowGuideOpener] = useState(false)

  const roomIds = (params.get("historyRooms") ?? params.get("historyRoom") ?? "")
    .split(",")
    .filter(Boolean)
  const organizerIds = (params.get("historyUsers") ?? "").split(",").filter(Boolean)
  const capacity = params.get("historyCapacity")
  const selectedCapacity = capacities.find((item) => item === capacity)
  const amenity = params.get("historyAmenity") as TRoomAmenity | null
  const from = params.get("historyFrom") ?? ""
  const to = params.get("historyTo") ?? ""
  const mine = params.get("historyMine") === "true"

  const bookings = useInfiniteBookingSearch(
    {
      search: query || undefined,
      roomIds: roomIds.length ? roomIds : undefined,
      participantId: mine ? DEFAULT_EMPLOYEE_ID : undefined,
      organizerIds: organizerIds.length ? organizerIds : undefined,
      from: from ? fromDateAndTime(from, "00:00") : undefined,
      to: to ? fromDateAndTime(to, "23:59") : undefined,
      capacity: selectedCapacity ? [selectedCapacity] : undefined,
      amenities: amenity ? [amenity] : undefined,
    },
    open
  )

  const update = (changes: Record<string, string | undefined>) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(changes).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key)
        )

        return next
      },
      { replace: true }
    )

  const updateSearch = useDebouncedCallback(
    (value: string) => update({ historyQuery: value || undefined }),
    BOOKING_SEARCH_DEBOUNCE_MILLISECONDS
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSearch(query))

    return () => window.cancelAnimationFrame(frame)
  }, [query])

  const results = bookings.data?.pages.flatMap((page) => page.items) ?? []
  const total = bookings.data?.pages[0]?.total ?? 0

  const openBooking = (bookingId: string, bookingRoomId: string, startAt: string) => {
    const next = new URLSearchParams(params)
    next.delete("history")
    next.set("room", bookingRoomId)
    next.set("date", appDateKey(startAt))
    next.set("booking", bookingId)
    void navigate({ pathname: PATHS.home, search: next.toString() })
  }

  return (
    <>
      <Dialog
        open={open && !showGuideOpener}
        onOpenChange={(next) => {
          if (!showGuideOpener) onOpenChange(next)
        }}
      >
        <DialogContent className="flex h-[calc(82dvh+100px)] max-h-[calc(42rem+100px)] max-w-5xl flex-col overflow-hidden gap-3 sm:max-w-5xl">
          <ModalGuideQuestionButton guideId="booking-search" />
          <DialogHeader>
            <DialogTitle>{t("fullSearch")}</DialogTitle>
            <DialogDescription>{t("fullSearchHint")}</DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
            <div
              data-modal-guide="search-filters"
              className="flex min-h-0 flex-col gap-2 overflow-hidden border-r pr-3"
            >
              <label className="relative block">
                <span className="sr-only">{t("searchBookings")}</span>
                <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    updateSearch(event.target.value)
                  }}
                  placeholder={t("searchBookings")}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-xs font-medium">
                  {t("fromDate")}
                  <Input
                    type="date"
                    lang={nativeDateLocale(i18n.language)}
                    value={from}
                    onChange={(event) => update({ historyFrom: event.target.value || undefined })}
                  />
                </label>
                <label className="space-y-1 text-xs font-medium">
                  {t("toDate")}
                  <Input
                    type="date"
                    lang={nativeDateLocale(i18n.language)}
                    value={to}
                    onChange={(event) => update({ historyTo: event.target.value || undefined })}
                  />
                </label>
              </div>
              <Button
                type="button"
                variant={mine ? "default" : "outline"}
                className="w-full"
                onClick={() => update({ historyMine: mine ? undefined : "true" })}
              >
                {mine && <Check />}
                {t("myBookingsOnly")}
              </Button>
              <FilterButtons
                title={t("capacity")}
                values={capacities}
                selected={capacity}
                label={(value) => value}
                onSelect={(value) =>
                  update({ historyCapacity: value === capacity ? undefined : value })
                }
              />
              <FilterButtons
                title={t("amenities")}
                values={amenities}
                selected={amenity}
                label={(value) => t(value)}
                onSelect={(value) =>
                  update({ historyAmenity: value === amenity ? undefined : value })
                }
              />
              <fieldset className="flex min-h-0 flex-1 flex-col">
                <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
                  {t("rooms")}
                </legend>
                <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
                  {rooms.data?.map((room) => {
                    const selected = roomIds.includes(room.id)
                    const nextRooms = selected
                      ? roomIds.filter((id) => id !== room.id)
                      : [...roomIds, room.id]

                    return (
                      <BookingSearchFilterCard
                        key={room.id}
                        selected={selected}
                        onSelect={() =>
                          update({
                            historyRooms: nextRooms.length ? nextRooms.join(",") : undefined,
                            historyRoom: undefined,
                          })
                        }
                      >
                        <span className="block text-xs font-semibold">
                          {localize(room.name, i18n.language)}
                        </span>
                        <span className="mt-1 flex items-start gap-1 text-[10px] text-muted-foreground">
                          <Users className="mt-px size-3 shrink-0" />
                          {t("roomPlaces", { count: room.capacity })} ·{" "}
                          {room.amenities
                            .slice(0, 2)
                            .map((item) => t(item))
                            .join(", ")}
                        </span>
                      </BookingSearchFilterCard>
                    )
                  })}
                </div>
              </fieldset>
              <fieldset className="flex min-h-0 flex-1 flex-col">
                <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
                  {t("attendees")}
                </legend>
                <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
                  {employees.data?.map((employee) => {
                    const selected = organizerIds.includes(employee.id)
                    const nextUsers = selected
                      ? organizerIds.filter((id) => id !== employee.id)
                      : [...organizerIds, employee.id]

                    return (
                      <BookingSearchFilterCard
                        key={employee.id}
                        selected={selected}
                        onSelect={() =>
                          update({
                            historyUsers: nextUsers.length ? nextUsers.join(",") : undefined,
                            historyMine: undefined,
                          })
                        }
                      >
                        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
                          <UserRound className="size-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{localize(employee.name, i18n.language)}</span>
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                          {employee.email}
                        </span>
                      </BookingSearchFilterCard>
                    )
                  })}
                </div>
              </fieldset>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  update({
                    historyQuery: undefined,
                    historyRoom: undefined,
                    historyRooms: undefined,
                    historyCapacity: undefined,
                    historyAmenity: undefined,
                    historyFrom: undefined,
                    historyTo: undefined,
                    historyMine: undefined,
                    historyUsers: undefined,
                  })
                }
              >
                {t("clearFilters")}
              </Button>
            </div>
            <div
              data-modal-guide="search-results"
              className="flex min-h-0 flex-col"
            >
              <p className="shrink-0 border-b bg-popover py-2 text-xs text-muted-foreground">
                {t("bookingsCount", { count: total })}
              </p>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pt-2">
                {bookings.isPending &&
                  Array.from({ length: 7 }, (_, index) => (
                    <Skeleton
                      key={index}
                      className="h-24 w-full"
                    />
                  ))}
                {!bookings.isPending && !results.length && (
                  <p className="text-sm text-muted-foreground">{t("noSearchResults")}</p>
                )}
                {results.map((booking) => {
                  const room = rooms.data?.find((item) => item.id === booking.roomId)
                  const employee = employees.data?.find((item) => item.id === booking.organizerId)

                  return (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      accessibleLabel={localize(booking.title, i18n.language)}
                      participationColors={false}
                      className="w-full bg-card p-3 hover:bg-accent/70"
                      onOpen={() => openBooking(booking.id, booking.roomId, booking.startAt)}
                    >
                      <div className="pointer-events-none relative z-10 flex justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <strong className="truncate">
                            {localize(booking.title, i18n.language)}
                          </strong>
                          {booking.status === "cancelled" && (
                            <Badge variant="outline">{t("cancelled")}</Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAppDate(booking.startAt, i18n.language, { dateStyle: "medium" })}
                        </span>
                      </div>
                      <p className="pointer-events-none relative z-10 mt-1 text-xs text-muted-foreground">
                        <BookingTimeRange
                          start={formatAppTime(booking.startAt, i18n.language)}
                          end={formatAppTime(booking.endAt, i18n.language)}
                        />{" "}
                        · {room ? localize(room.name, i18n.language) : ""}
                      </p>
                      <p className="pointer-events-none relative z-10 mt-1 text-xs">
                        {t("organizer")}:{" "}
                        {employee ? localize(employee.name, i18n.language) : booking.organizerId}
                      </p>
                    </BookingCard>
                  )
                })}
                {bookings.hasNextPage && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={bookings.isFetchingNextPage}
                    onClick={() => void bookings.fetchNextPage()}
                  >
                    {bookings.isFetchingNextPage ? t("loading") : t("loadMore")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ModalGuide
        id="booking-search"
        title={t("fullSearch")}
        opener={{
          id: "open",
          title: t("fullSearch"),
          description: t("modalGuideOpenSearchDescription"),
          selector: '[data-modal-opener="booking-search"]',
        }}
        steps={[
          {
            id: "filters",
            title: t("filters"),
            description: t("modalGuideSearchFiltersDescription"),
            selector: '[data-modal-guide="search-filters"]',
          },
          {
            id: "results",
            title: t("modalGuideSearchResultsTitle"),
            description: t("modalGuideSearchResultsDescription"),
            selector: '[data-modal-guide="search-results"]',
          },
        ]}
        onShowOpener={setShowGuideOpener}
      />
    </>
  )
}
