import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { QUERY_GC_TIME_MILLISECONDS, QUERY_STALE_TIME_MILLISECONDS } from "@/constants"

import "./index.css"
import "./i18n"

import App from "./App.tsx"
import { enableMocking } from "./mocks/enableMocking.ts"

const reloadAfterStaleChunk = (event: Event) => {
  event.preventDefault()

  const reloadKey = "vite-stale-chunk-reload"
  if (sessionStorage.getItem(reloadKey) === "true") return

  sessionStorage.setItem(reloadKey, "true")
  window.location.reload()
}

window.addEventListener("vite:preloadError", reloadAfterStaleChunk)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MILLISECONDS,
      gcTime: QUERY_GC_TIME_MILLISECONDS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const startApplication = async () => {
  await enableMocking()
  const root = document.getElementById("root")
  if (!root) throw new Error("Application root element was not found.")

  sessionStorage.removeItem("vite-stale-chunk-reload")

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}

void startApplication()
