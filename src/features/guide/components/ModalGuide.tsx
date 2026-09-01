import { lazy, Suspense, useEffect, useState } from "react"

import { loadModalGuideSession } from "../utils"

/** Defers loading the interactive guide session until it is needed. */
const ModalGuideSession = lazy(() =>
  loadModalGuideSession().then((module) => ({ default: module.ModalGuideSession }))
)

export interface IModalGuideStep {
  id: string
  title: string
  description: string
  selector: string
}

interface IProps {
  id: string
  title: string
  opener: IModalGuideStep
  steps: IModalGuideStep[]
  onShowOpener: (show: boolean) => void
}

/** Safely extracts a guide identifier from a custom-event payload. */
const guideIdFromDetail = (detail: unknown): unknown => {
  if (typeof detail === "string") return detail
  if (detail && typeof detail === "object" && "id" in detail) return detail.id

  return undefined
}

/** Lazily launches a guide that walks through controls inside modal interfaces. */
export const ModalGuide = ({ id, title, opener, steps, onShowOpener }: IProps) => {
  const [stepIndex, setStepIndex] = useState<number>()

  useEffect(() => {
    const start = (event: Event) => {
      if (!(event instanceof CustomEvent)) return
      const detail = event.detail as unknown
      const requestedId = guideIdFromDetail(detail)
      if (requestedId !== id) return
      const keepModalOpen =
        detail !== null && typeof detail === "object" && "keepModalOpen" in detail
          ? detail.keepModalOpen === true
          : false
      onShowOpener(!keepModalOpen)
      setStepIndex(keepModalOpen ? 1 : 0)
    }
    window.addEventListener("modal-guide:start", start)

    return () => window.removeEventListener("modal-guide:start", start)
  }, [id, onShowOpener])

  if (stepIndex === undefined) return null

  return (
    <Suspense fallback={null}>
      <ModalGuideSession
        id={id}
        title={title}
        steps={[opener, ...steps]}
        stepIndex={stepIndex}
        onStepIndex={setStepIndex}
        onShowOpener={onShowOpener}
        onClose={() => {
          onShowOpener(false)
          setStepIndex(undefined)
        }}
      />
    </Suspense>
  )
}
