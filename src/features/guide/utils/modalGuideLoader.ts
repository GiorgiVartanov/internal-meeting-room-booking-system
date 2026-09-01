/** Loads the modal guide implementation only when contextual help is requested. */
export const loadModalGuideSession = () => import("../components/ModalGuideSession")

/** Starts loading modal guide code before the employee opens a guide. */
export const preloadModalGuides = () => loadModalGuideSession()
