import {
  Accessibility,
  AirVent,
  Lightbulb,
  Monitor,
  Sun,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { localize } from "@/lib/localize"
import type { IRoom, TRoomAmenity } from "@/types"

import { RoomImage } from "./RoomImage"

interface IProps {
  room: IRoom
  compact?: boolean
  showImage?: boolean
}

/** Selects the icon associated with a room amenity. */
const amenityIcon = (amenity: TRoomAmenity): LucideIcon | undefined => {
  if (amenity === "display") return Monitor
  if (amenity === "video-conference") return Video

  return undefined
}

/** Presents the room details employees need before choosing where to book. */
export const RoomCard = ({ room, compact = false, showImage = false }: IProps) => {
  const { t, i18n } = useTranslation()

  return (
    <article
      data-guide="room-details"
      className={
        compact
          ? "space-y-3"
          : "grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border bg-panel shadow-sm"
      }
    >
      {(!compact || showImage) && (
        <RoomImage
          room={room}
          compact={compact}
        />
      )}
      <div className={compact ? "" : "border-t p-6 sm:p-8"}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            {t("floor")} {room.floor}
          </Badge>
          <Badge variant="outline">
            <Users />
            {t("roomPlaces", { count: room.capacity })}
          </Badge>
        </div>
        <h2
          className={
            compact ? "text-xl font-semibold" : "text-3xl font-semibold tracking-tight sm:text-4xl"
          }
        >
          {localize(room.name, i18n.language)}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {localize(room.description, i18n.language)}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {room.amenities.map((amenity) => {
            const Icon = amenityIcon(amenity)

            return (
              <Badge
                key={amenity}
                variant="secondary"
              >
                {Icon && <Icon />}
                {t(amenity)}
              </Badge>
            )
          })}
          {room.hasNaturalLight && (
            <Badge variant="secondary">
              <Sun />
              {t("naturalLight")}
            </Badge>
          )}
          <Badge variant="secondary">
            <Lightbulb />
            {t(`lightQuality.${room.lightQuality}`)}
          </Badge>
          {room.airConditionerCount > 0 && (
            <Badge variant="secondary">
              <AirVent />
              {t("workingAirConditioner", { count: room.airConditionerCount })}
            </Badge>
          )}
          {room.isAccessible && (
            <Badge variant="secondary">
              <Accessibility />
              {t("accessible")}
            </Badge>
          )}
        </div>
      </div>
    </article>
  )
}
