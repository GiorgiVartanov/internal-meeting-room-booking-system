import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useDebouncedCallback } from "@/hooks"

import type { ReactElement, ReactNode } from "react"

const STORAGE_KEY = "meeting-room-dashboard-panel-percent-v7"

interface IProps {
  calendar: ReactNode
  sidebar?: ReactNode
}

/** Restores a valid persisted dashboard sidebar width. */
const readSidebarSize = (): number => {
  if (window.innerWidth >= 2560) return Math.max(8, Math.min(18, (420 / window.innerWidth) * 100))

  const saved = Number(localStorage.getItem(STORAGE_KEY))

  return Number.isFinite(saved) && saved >= 15 && saved <= 70 ? saved : 20
}

/** Arranges dashboard calendar and details in user-resizable panels. */
export const ResizableDashboardLayout = ({ calendar, sidebar }: IProps): ReactElement => {
  const saveSidebarSize = useDebouncedCallback((percentage: number) =>
    localStorage.setItem(STORAGE_KEY, String(Math.round(percentage)))
  )

  if (!sidebar) return <div className="h-full min-h-0 border">{calendar}</div>
  const sidebarSize = readSidebarSize()

  return (
    <>
      <div className="hidden h-full min-h-0 lg:block">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="dashboard-calendar"
            defaultSize={`${100 - sidebarSize}%`}
            minSize={window.innerWidth >= 2560 ? "82%" : "30%"}
            maxSize={window.innerWidth >= 2560 ? "92%" : "85%"}
          >
            <div className="h-full overflow-hidden border">{calendar}</div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className="mx-1"
          />
          <ResizablePanel
            id="dashboard-sidebar"
            defaultSize={`${sidebarSize}%`}
            minSize="320px"
            maxSize={window.innerWidth >= 2560 ? "18%" : "70%"}
            onResize={(size, _id, previous) => {
              if (previous) saveSidebarSize(size.asPercentage)
            }}
          >
            <div className="h-full">
              <aside className="h-full min-h-0 overflow-auto border">{sidebar}</aside>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="h-full min-h-0 border lg:hidden">{calendar}</div>
    </>
  )
}
