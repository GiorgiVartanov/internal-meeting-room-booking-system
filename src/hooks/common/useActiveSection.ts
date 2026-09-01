import { useEffect, useState } from "react"

import type { RefObject } from "react"

export const useActiveSection = (
  containerRef: RefObject<HTMLElement | null>,
  sectionIds: readonly string[]
) => {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "")

  useEffect(() => {
    const container = containerRef.current
    if (!container || sectionIds.length === 0) return

    let animationFrame: number | undefined
    const updateActiveSection = () => {
      const containerBounds = container.getBoundingClientRect()
      const activationLine = containerBounds.top + Math.min(160, container.clientHeight * 0.2)
      let nextSection = sectionIds[0] ?? ""

      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId)
        if (section && section.getBoundingClientRect().top <= activationLine)
          nextSection = sectionId
      }

      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2)
        nextSection = sectionIds.at(-1) ?? nextSection

      setActiveSection((current) => (current === nextSection ? current : nextSection))
    }
    const scheduleUpdate = () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    container.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      container.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [containerRef, sectionIds])

  return activeSection
}
