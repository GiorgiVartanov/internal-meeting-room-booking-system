import { CircleHelp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

interface IProps {
  guideId: string
}

/** Opens contextual help for the modal that contains this question button. */
export const ModalGuideQuestionButton = ({ guideId }: IProps) => {
  const { t } = useTranslation()

  return (
    <Button
      data-dialog-dismiss-protected
      type="button"
      size="icon"
      variant="ghost"
      className="absolute right-[3.25rem] top-4 z-[70]"
      aria-label={t("guideOpen")}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("modal-guide:start", {
            detail: { id: guideId, keepModalOpen: true },
          })
        )
      }
    >
      <CircleHelp />
    </Button>
  )
}
