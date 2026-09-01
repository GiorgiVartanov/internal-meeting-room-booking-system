import { ImageOff } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import type { IRoom } from "@/types"

const placeholderUrls = [
  "/images/meeting-room-placeholder.webp",
  "/images/small-meeting-room-placeholder.webp",
]

if (typeof Image !== "undefined")
  placeholderUrls.forEach((source) => {
    const image = new Image()
    image.src = source
  })

interface IProps {
  room: IRoom
  compact: boolean
}

/** Displays a room image with deterministic fallbacks when loading fails. */
export const RoomImage = ({ room, compact }: IProps) => {
  const { t } = useTranslation()
  const [failedSource, setFailedSource] = useState<string>()

  const unavailable = !room.imageUrl || failedSource === room.imageUrl

  if (unavailable)
    return (
      <div
        role="img"
        aria-label={t("roomImageUnavailable")}
        className={cn(
          "flex flex-col items-center justify-center gap-3 border bg-muted/40 text-center text-muted-foreground",
          compact ? "h-44 w-full" : "size-full min-h-0"
        )}
      >
        <ImageOff className="size-10" />
        <span className="text-xs font-medium">{t("roomImageUnavailable")}</span>
      </div>
    )

  return (
    <img
      src={room.imageUrl}
      alt=""
      onError={() => setFailedSource(room.imageUrl)}
      className={compact ? "h-44 w-full border object-cover" : "size-full min-h-0 object-cover"}
    />
  )
}
