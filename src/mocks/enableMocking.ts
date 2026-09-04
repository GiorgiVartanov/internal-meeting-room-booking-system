export const enableMocking = async () => {
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW !== "true") return

  const { worker } = await import("./browser")
  const startWorker = () => worker.start({ onUnhandledRequest: "bypass" })

  try {
    await startWorker()
  } catch (error) {
    const registration = await navigator.serviceWorker.getRegistration()

    if (!registration) throw error

    await registration.unregister()
    await startWorker()
  }
}
