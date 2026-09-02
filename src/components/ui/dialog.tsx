import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import i18n from "@/i18n"
import { XIcon } from "lucide-react"

const openDialogIds = new Set<symbol>()
const DialogBackdropCloseContext = React.createContext<() => void>(() => undefined)

const setDialogOpen = (dialogId: symbol, open: boolean): void => {
  if (open) openDialogIds.add(dialogId)
  else openDialogIds.delete(dialogId)
  document.body.toggleAttribute("data-dialog-open", openDialogIds.size > 0)
}

function Dialog({
  modal = false,
  onOpenChange,
  open,
  actionsRef,
  ...props
}: DialogPrimitive.Root.Props) {
  const [dialogId] = React.useState(() => Symbol("dialog"))
  const internalActionsRef = React.useRef<DialogPrimitive.Root.Actions>(null)
  const backdropDismissRef = React.useRef(false)

  React.useEffect(() => {
    setDialogOpen(dialogId, Boolean(open))

    return () => setDialogOpen(dialogId, false)
  }, [dialogId, open])

  const handleOpenChange: DialogPrimitive.Root.Props["onOpenChange"] = (open, details) => {
    const allowedDismiss =
      details.reason === "close-press" ||
      details.reason === "escape-key" ||
      details.reason === "trigger-press" ||
      (details.reason === "imperative-action" && backdropDismissRef.current)

    if (!open && !allowedDismiss) {
      backdropDismissRef.current = false
      details.cancel()

      return
    }
    backdropDismissRef.current = false
    setDialogOpen(dialogId, open)
    onOpenChange?.(open, details)
  }

  const closeFromBackdrop = React.useCallback(() => {
    backdropDismissRef.current = true
    internalActionsRef.current?.close()
  }, [])

  return (
    <DialogBackdropCloseContext.Provider value={closeFromBackdrop}>
      <DialogPrimitive.Root
        data-slot="dialog"
        modal={modal}
        disablePointerDismissal
        actionsRef={actionsRef ?? internalActionsRef}
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </DialogBackdropCloseContext.Provider>
  )
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  )
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  )
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  )
}

function DialogOverlay({ className, onPointerDown, ...props }: DialogPrimitive.Backdrop.Props) {
  const closeFromBackdrop = React.useContext(DialogBackdropCloseContext)

  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-[59] bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-ending-style:backdrop-blur-none data-closed:animate-out data-closed:backdrop-blur-none data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0",
        className
      )}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!event.defaultPrevented && event.target === event.currentTarget) closeFromBackdrop()
      }}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  placement = "top",
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  placement?: "top" | "center"
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 z-[65] grid w-full max-w-[calc(100%-1.5rem)] -translate-x-1/2 gap-4 rounded-none bg-popover p-4 text-xs/relaxed text-popover-foreground ring-1 ring-border duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          placement === "top" ? "top-[6dvh] max-h-[89dvh]" : "top-1/2 -translate-y-1/2",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4 z-[90]"
                size="icon"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{i18n.t("close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "sticky top-0 z-[80] flex shrink-0 flex-col gap-1.5 border-b bg-popover pb-3 pr-10 text-left",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {i18n.t("close")}
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-base font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
