import { Search, SlidersHorizontal, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { localize } from "@/lib/localize"
import { cn } from "@/lib/utils"
import type { IRoom, IRoomFilters } from "@/types"
import { useDebouncedCallback } from "@/hooks"

import { RoomFilters } from "./RoomFilters"

interface IProps {
  rooms: IRoom[]
  loading: boolean
  filters: IRoomFilters
  description?: string
  countFirst?: boolean
  selectedId?: string
  unavailableRoomIds?: ReadonlySet<string>
  onFilters: (filters: IRoomFilters) => void
  onSelect: (room: IRoom) => void
}

/** Provides searchable room navigation and URL-compatible room filters. */
export const RoomsSidebar = ({
  rooms,
  loading,
  filters,
  description,
  countFirst = false,
  selectedId,
  unavailableRoomIds,
  onFilters,
  onSelect,
}: IProps) => {
  const { t, i18n } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState(filters.search ?? "")
  const searchInput = useRef<HTMLInputElement>(null)
  const updateSearch = useDebouncedCallback((value: string) =>
    onFilters({ ...filters, search: value || undefined })
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSearch(filters.search ?? ""))

    return () => window.cancelAnimationFrame(frame)
  }, [filters.search])

  useEffect(() => {
    const openFilters = () => {
      setFiltersOpen(true)
      window.requestAnimationFrame(() => searchInput.current?.focus())
    }
    window.addEventListener("meeting-room:open-filters", openFilters)

    return () => window.removeEventListener("meeting-room:open-filters", openFilters)
  }, [])

  const hasFilters = Boolean(
    filters.search ||
    filters.capacity?.length ||
    filters.amenities?.length ||
    filters.hasAirConditioning ||
    filters.isAccessible
  )

  return (
    <div
      data-guide="room-filters"
      className="flex h-full min-h-0 flex-col bg-panel"
    >
      <div className="border-b p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            countFirst ? "justify-start" : "justify-between"
          )}
        >
          {countFirst && (
            <span className="text-xs text-muted-foreground">
              {loading ? t("loading") : t("roomResults", { count: rooms.length })}
            </span>
          )}
          <h2 className="font-semibold">{t("rooms")}</h2>
          {!countFirst && (
            <span className="text-xs text-muted-foreground">
              {loading ? t("loading") : t("roomResults", { count: rooms.length })}
            </span>
          )}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        <label className="relative mt-3 block">
          <span className="sr-only">{t("searchRooms")}</span>
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input
            ref={searchInput}
            className="pl-8"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              updateSearch(event.target.value)
            }}
            placeholder={t("searchRooms")}
          />
        </label>
        <Button
          variant="outline"
          className="mt-3 w-full"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal />
          {t("showFilters")}
        </Button>
        {filtersOpen && (
          <div className="mt-4 max-h-[42vh] overflow-y-auto border-t pt-4">
            <RoomFilters
              filters={filters}
              onChange={onFilters}
            />
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-5 w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => onFilters({})}
              >
                {t("clearFilters")}
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {loading &&
          Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-24 w-full"
            />
          ))}
        {!loading && !rooms.length && (
          <p className="text-sm text-muted-foreground">{t("noRooms")}</p>
        )}
        {rooms.map((room) => {
          const selected = room.id === selectedId
          const unavailable = unavailableRoomIds?.has(room.id) ?? false

          return (
            <button
              key={room.id}
              type="button"
              disabled={unavailable}
              onPointerEnter={() => {
                if (room.imageUrl) new Image().src = room.imageUrl
              }}
              onFocus={() => {
                if (room.imageUrl) new Image().src = room.imageUrl
              }}
              onClick={() => onSelect(room)}
              className={cn(
                "w-full border bg-card p-3 text-left outline outline-0 outline-primary/40 transition-colors hover:border-primary/70 hover:bg-accent/70",
                unavailable &&
                  "cursor-not-allowed border-destructive/60 bg-destructive/10 text-destructive hover:border-destructive/60 hover:bg-destructive/10",
                selected &&
                  "border-primary bg-primary/10 outline-2 -outline-offset-2 hover:bg-primary/20"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{localize(room.name, i18n.language)}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  {t("roomPlaces", { count: room.capacity })}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("floor")} {room.floor}
              </p>
              {unavailable && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  {t("bookedAtSelectedTime")}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {room.amenities.slice(0, 3).map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={selected ? "default" : "secondary"}
                  >
                    {t(amenity)}
                  </Badge>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
