import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useDebouncedCallback } from "@/hooks"

import type { ReactElement, ReactNode } from "react"

const STORAGE_KEY = "meeting-room-panel-percent-v3"
interface IPanelSizes {
  schedule?: number
  room?: number
  rooms?: number
}
interface IProps {
  schedule: ReactNode
  room: ReactNode
  rooms: ReactNode
}

/** Checks whether persisted schedule panel sizes have a valid shape. */
const isPanelSizes = (value: unknown): value is IPanelSizes =>
  Boolean(
    value &&
    typeof value === "object" &&
    ["schedule", "room", "rooms"].every(
      (key) => Reflect.get(value, key) === undefined || typeof Reflect.get(value, key) === "number"
    )
  )

/** Restores valid schedule panel sizes from browser storage. */
const readSizes = (): IPanelSizes => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (isPanelSizes(value)) return value
  } catch {
    /* Invalid saved layouts fall back to the product defaults. */
  }

  return {}
}

/** Persists one resized schedule panel percentage. */
const saveSize = (key: keyof IPanelSizes, percentage: number): void =>
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...readSizes(), [key]: Math.round(percentage) })
  )

/** Arranges schedule, selected room, and room navigation in resizable panels. */
export const ResizableScheduleLayout = ({ schedule, room, rooms }: IProps): ReactElement => {
  const saved = readSizes()
  const viewportWidth = window.innerWidth
  const wideScreen = viewportWidth >= 2560
  const wideSidebarSize = Math.max(8, Math.min(18, (420 / viewportWidth) * 100))
  const scheduleSize = wideScreen ? wideSidebarSize : (saved.schedule ?? 20)
  const roomsSize = wideScreen ? wideSidebarSize : (saved.rooms ?? 20)
  const roomSize = wideScreen ? 100 - scheduleSize - roomsSize : (saved.room ?? 60)

  const saveSizeDebounced = useDebouncedCallback(saveSize)

  return (
    <div className="hidden h-full min-h-0 lg:block">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          id="schedule"
          defaultSize={`${scheduleSize}%`}
          minSize={wideScreen ? "8%" : "15%"}
          maxSize={wideScreen ? "18%" : "30%"}
          onResize={(size, _id, previous) =>
            previous && saveSizeDebounced("schedule", size.asPercentage)
          }
        >
          <div className="h-full">
            <aside className="h-full min-h-0 overflow-hidden border">{schedule}</aside>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="mx-1"
        />
        <ResizablePanel
          id="room"
          defaultSize={`${roomSize}%`}
          minSize={wideScreen ? "64%" : "40%"}
          maxSize={wideScreen ? "84%" : "70%"}
          onResize={(size, _id, previous) =>
            previous && saveSizeDebounced("room", size.asPercentage)
          }
        >
          <div className="h-full">
            <section className="h-full min-h-0 min-w-0 overflow-hidden">{room}</section>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="mx-1"
        />
        <ResizablePanel
          id="rooms"
          defaultSize={`${roomsSize}%`}
          minSize={wideScreen ? "8%" : "15%"}
          maxSize={wideScreen ? "18%" : "30%"}
          onResize={(size, _id, previous) =>
            previous && saveSizeDebounced("rooms", size.asPercentage)
          }
        >
          <div className="h-full">
            <aside className="h-full min-h-0 overflow-hidden border">{rooms}</aside>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
