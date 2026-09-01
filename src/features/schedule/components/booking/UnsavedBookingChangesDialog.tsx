import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface IProps {
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onSave: () => void
}

/** Prompts employees to save or discard booking edits before closing the editor. */
export const UnsavedBookingChangesDialog = ({
  open,
  pending,
  onOpenChange,
  onDiscard,
  onSave,
}: IProps) => {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        data-dialog-dismiss-protected
        placement="center"
      >
        <DialogHeader>
          <DialogTitle>{t("unsavedChanges")}</DialogTitle>
          <DialogDescription>{t("saveBeforeClosing")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("keepEditing")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDiscard}
          >
            {t("discardChanges")}
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={onSave}
          >
            {t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
