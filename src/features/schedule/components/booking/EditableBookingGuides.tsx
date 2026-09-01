import { useTranslation } from "react-i18next"

import { ModalGuide } from "@/features/guide"

interface IProps {
  onShowEditOpener: (visible: boolean) => void
  onShowRoomOpener: (visible: boolean) => void
}

/** Defines the guided walkthroughs for editing a booking and changing its room. */
export const EditableBookingGuides = ({ onShowEditOpener, onShowRoomOpener }: IProps) => {
  const { t } = useTranslation()

  return (
    <>
      <ModalGuide
        id="edit-booking"
        title={t("editBooking")}
        opener={{
          id: "open",
          title: t("editBooking"),
          description: t("modalGuideOpenEditDescription"),
          selector: '[data-modal-opener="edit-booking"]',
        }}
        steps={[
          {
            id: "form",
            title: t("editBooking"),
            description: t("modalGuideEditFormDescription"),
            selector: '[data-modal-guide="edit-form"]',
          },
          {
            id: "time",
            title: t("modalGuideEditTimeTitle"),
            description: t("modalGuideEditTimeDescription"),
            selector: '[data-modal-guide="edit-time"]',
          },
          {
            id: "room",
            title: t("changeRoom"),
            description: t("modalGuideEditRoomDescription"),
            selector: '[data-modal-guide="edit-room"]',
          },
        ]}
        onShowOpener={onShowEditOpener}
      />
      <ModalGuide
        id="change-room"
        title={t("changeRoom")}
        opener={{
          id: "open",
          title: t("changeRoom"),
          description: t("modalGuideOpenRoomPickerDescription"),
          selector: '[data-modal-opener="change-room"]',
        }}
        steps={[
          {
            id: "rooms",
            title: t("changeRoom"),
            description: t("modalGuideRoomPickerDescription"),
            selector: '[data-modal-guide="change-room-list"]',
          },
        ]}
        onShowOpener={onShowRoomOpener}
      />
    </>
  )
}
