import { useRef, useState } from "react"

import type { IDragState } from "../utils"
import type { PointerEvent as ReactPointerEvent } from "react"

type TResolveDrag = (drag: IDragState, clientY: number) => IDragState
type TDropDrag = (drag: IDragState) => void

interface IStartDragOptions {
  bookingId: string
  enabled: boolean
  originY: number
  resolveDrag: TResolveDrag
  onDrop: TDropDrag
}

interface IDragSession {
  drag: IDragState
  resolveDrag: TResolveDrag
  onDrop: TDropDrag
}

interface IUseTimelineBookingDrag {
  drag?: IDragState
  startDrag: (event: ReactPointerEvent<HTMLElement>, options: IStartDragOptions) => void
  moveDrag: (event: ReactPointerEvent<HTMLElement>) => void
  finishDrag: (event: ReactPointerEvent<HTMLElement>) => void
  cancelDrag: () => void
  shouldOpenBooking: () => boolean
}

/** Coordinates pointer-based booking moves/resizes while distinguishing clicks from drags. */
export const useTimelineBookingDrag = (): IUseTimelineBookingDrag => {
  const [drag, setDrag] = useState<IDragState>()
  const sessionRef = useRef<IDragSession | undefined>(undefined)
  const pointerDownAtRef = useRef<number | undefined>(undefined)
  const suppressClickRef = useRef(false)

  const startDrag = (
    event: ReactPointerEvent<HTMLElement>,
    { bookingId, enabled, originY, resolveDrag, onDrop }: IStartDragOptions
  ): void => {
    pointerDownAtRef.current = performance.now()
    if (!enabled) return

    event.preventDefault()
    event.stopPropagation()
    const resizeHandle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize-handle]")
      ?.dataset.resizeHandle
    let mode: IDragState["mode"] = "move"
    if (resizeHandle === "start") mode = "resize-start"
    if (resizeHandle === "end") mode = "resize-end"
    const nextDrag = { bookingId, originY, deltaMinutes: 0, mode }
    event.currentTarget.setPointerCapture(event.pointerId)
    suppressClickRef.current = false
    sessionRef.current = { drag: nextDrag, resolveDrag, onDrop }
    setDrag(nextDrag)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const session = sessionRef.current
    if (!session) return

    event.stopPropagation()
    const nextDrag = session.resolveDrag(session.drag, event.clientY)
    if (nextDrag.deltaMinutes === session.drag.deltaMinutes) return

    if (nextDrag.deltaMinutes !== 0) suppressClickRef.current = true
    session.drag = nextDrag
    setDrag(nextDrag)
  }

  const finishDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const session = sessionRef.current
    if (!session) return

    event.stopPropagation()
    const finalDrag = session.resolveDrag(session.drag, event.clientY)
    if (finalDrag.deltaMinutes !== 0) suppressClickRef.current = true
    session.onDrop(finalDrag)
    sessionRef.current = undefined
    setDrag(undefined)
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const cancelDrag = (): void => {
    pointerDownAtRef.current = undefined
    sessionRef.current = undefined
    setDrag(undefined)
  }

  const shouldOpenBooking = (): boolean => {
    const heldFor = pointerDownAtRef.current ? performance.now() - pointerDownAtRef.current : 0
    pointerDownAtRef.current = undefined
    const suppressed = suppressClickRef.current || heldFor >= 500
    suppressClickRef.current = false

    return !suppressed
  }

  return { drag, startDrag, moveDrag, finishDrag, cancelDrag, shouldOpenBooking }
}
