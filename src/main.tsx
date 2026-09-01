import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import "./i18n"

import App from "./App.tsx"
import { enableMocking } from "./mocks/enableMocking.ts"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, gcTime: 30 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

const startApplication = async () => {
  await enableMocking()
  const root = document.getElementById("root")
  if (!root) throw new Error("Application root element was not found.")

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
}

void startApplication()
