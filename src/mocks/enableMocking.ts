export const enableMocking = async () => {
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW !== "true") return

  const { worker } = await import("./browser")
  const startWorker = () => worker.start({ onUnhandledRequest: "bypass" })

  try {
    await startWorker()
  } catch (error) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    const registration = registrations.find((candidate) => {
      const serviceWorker = candidate.active ?? candidate.waiting ?? candidate.installing

      return serviceWorker && new URL(serviceWorker.scriptURL).pathname === "/mockServiceWorker.js"
    })

    if (!registration) throw error

    await registration.unregister()
    await startWorker()
  }
}
