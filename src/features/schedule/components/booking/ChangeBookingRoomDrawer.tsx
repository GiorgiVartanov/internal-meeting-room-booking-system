import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ModalGuideQuestionButton } from "@/features/guide"
import { RoomsSidebar } from "@/features/rooms"
import type { IRoom, IRoomFilters } from "@/types"

import type { UseFormReturn } from "react-hook-form"
import type { TEditBookingForm } from "../../utils/editBookingForm"

interface IProps {
  open: boolean
  guideOpenerVisible: boolean
  rooms: IRoom[]
  filters: IRoomFilters
  roomId: string
  unavailableRoomIds: ReadonlySet<string>
  selectedRoom?: IRoom
  form: UseFormReturn<TEditBookingForm>
  onFilters: (filters: IRoomFilters) => void
  onOpenChange: (open: boolean) => void
}

/** Lets an employee select an available replacement room while editing a booking. */
export const ChangeBookingRoomDrawer = ({
  open,
  guideOpenerVisible,
  rooms,
  filters,
  roomId,
  unavailableRoomIds,
  selectedRoom,
  form,
  onFilters,
  onOpenChange,
}: IProps) => {
  const { t } = useTranslation()

  return (
    <Drawer
      open={open && !guideOpenerVisible}
      onOpenChange={(next) => {
        if (!guideOpenerVisible) onOpenChange(next)
      }}
      swipeDirection="left"
    >
      <DrawerContent
        data-dialog-dismiss-protected
        className="h-dvh"
        overlayClassName="supports-backdrop-filter:backdrop-blur-none"
      >
        <ModalGuideQuestionButton guideId="change-room" />
        <DrawerHeader>
          <DrawerTitle>{t("changeRoom")}</DrawerTitle>
          <DrawerDescription>{t("selectRoomHint")}</DrawerDescription>
        </DrawerHeader>
        <div
          data-modal-guide="change-room-list"
          className="min-h-0 flex-1"
        >
          <RoomsSidebar
            rooms={rooms}
            loading={false}
            filters={filters}
            selectedId={roomId}
            unavailableRoomIds={unavailableRoomIds}
            onFilters={onFilters}
            onSelect={(room) => {
              form.setValue("roomId", room.id, { shouldDirty: true })
              form.setValue(
                "attendeeIds",
                form.getValues("attendeeIds").slice(0, Math.max(0, room.capacity - 1)),
                { shouldDirty: true }
              )
            }}
          />
        </div>
        <DrawerFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={!selectedRoom}
          >
            {t("useRoom")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
