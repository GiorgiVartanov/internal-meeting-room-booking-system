import { useEffect, useState } from "react"

import { Drawer, DrawerContent } from "@/components/ui/drawer"

import { DashboardDayPanel, type IDashboardDayProps } from "./DashboardDayPanel"

import type { ReactElement } from "react"

/** Hosts the selected day's room and booking details in a responsive drawer. */
export const DashboardDayDrawer = ({
  date,
  dateValue,
  rooms,
  bookings,
  loading,
  employees,
  selectedRoom,
  activeTab,
  onlyMine,
  mobileOpen,
  onClose,
  onRoom,
  onTab,
  onBooking,
  onEditBooking,
}: IDashboardDayProps): ReactElement => {
  const [mobile, setMobile] = useState((): boolean => matchMedia("(max-width: 1023px)").matches)

  useEffect(() => {
    const query = matchMedia("(max-width: 1023px)")
    const change = (): void => setMobile(query.matches)
    query.addEventListener("change", change)

    return () => query.removeEventListener("change", change)
  }, [])

  return (
    <Drawer
      open={mobile && Boolean(mobileOpen)}
      onOpenChange={(open) => !open && onClose()}
      swipeDirection="right"
    >
      <DrawerContent className="h-dvh">
        <DashboardDayPanel
          date={date}
          dateValue={dateValue}
          rooms={rooms}
          bookings={bookings}
          loading={loading}
          employees={employees}
          selectedRoom={selectedRoom}
          activeTab={activeTab}
          onlyMine={onlyMine}
          mobileOpen={mobileOpen}
          onClose={onClose}
          onRoom={onRoom}
          onTab={onTab}
          onBooking={onBooking}
          onEditBooking={onEditBooking}
        />
      </DrawerContent>
    </Drawer>
  )
}
