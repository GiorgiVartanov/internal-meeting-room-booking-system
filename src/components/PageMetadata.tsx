import { useEffect } from "react"
import { useLocation } from "react-router-dom"

interface IPageMetadata {
  title: string
  description: string
}

const DEFAULT_METADATA: IPageMetadata = {
  title: "Meeting room booking",
  description: "Find meeting rooms, check availability, and manage workplace bookings.",
}

const PAGE_METADATA: Record<string, IPageMetadata> = {
  "/": {
    title: "Book a meeting room | Meeting room booking",
    description: "Find the right meeting room, check its availability, and book a time that works.",
  },
  "/dashboard": {
    title: "Dashboard | Meeting room booking",
    description: "See office-wide room activity, availability, and bookings at a glance.",
  },
  "/schedule": {
    title: "Schedule | Meeting room booking",
    description: "View and manage your upcoming meeting room bookings in a weekly schedule.",
  },
  "/documentation": {
    title: "Documentation | Meeting room booking",
    description: "Learn how to find rooms, create bookings, and manage your meeting schedule.",
  },
  "/about": {
    title: "About | Meeting room booking",
    description:
      "Explore the meeting room booking system, its features, and implementation details.",
  },
}

const setContent = (selector: string, content: string): void => {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content)
}

/** Keeps the browser title and social metadata aligned with the active route. */
const PageMetadata = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = PAGE_METADATA[pathname] ?? {
      title: `Page not found | ${DEFAULT_METADATA.title}`,
      description: "The requested page could not be found in the meeting room booking system.",
    }

    document.title = metadata.title
    setContent('meta[name="description"]', metadata.description)
    setContent('meta[property="og:title"]', metadata.title)
    setContent('meta[property="og:description"]', metadata.description)
    setContent('meta[name="twitter:title"]', metadata.title)
    setContent('meta[name="twitter:description"]', metadata.description)
    setContent('meta[property="og:url"]', window.location.href)
  }, [pathname])

  return null
}

export default PageMetadata
