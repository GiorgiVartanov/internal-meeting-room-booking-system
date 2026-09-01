import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

const modalGuideIds = new Set(["calendar", "booking-search", "booking-details", "edit-booking"])

/** Launches a supported modal guide requested through the current URL. */
export const ModalGuideUrlLauncher = () => {
  const [params, setParams] = useSearchParams()

  const requestedGuide = params.get("modalGuide")

  useEffect(() => {
    if (!requestedGuide || !modalGuideIds.has(requestedGuide)) return
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("modal-guide:start", { detail: requestedGuide }))
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.delete("modalGuide")

          return next
        },
        { replace: true }
      )
    })

    return () => window.cancelAnimationFrame(frame)
  }, [requestedGuide, setParams])

  return null
}
