import type { IGuideProgress, IUpdateGuideProgressInput, TGuidePage } from "@/types"

const STORAGE_KEY = "meeting-room-booking:guide-progress:v1"
const pages: TGuidePage[] = ["booking", "schedule", "dashboard"]

const emptyProgress = (): IGuideProgress => ({
  welcomeSeen: false,
  updatedAt: new Date(0).toISOString(),
})

const read = (): IGuideProgress => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return emptyProgress()
  try {
    const value: unknown = JSON.parse(stored)
    if (!value || typeof value !== "object") return emptyProgress()

    return {
      welcomeSeen: Reflect.get(value, "welcomeSeen") === true,
      lastPosition:
        Reflect.get(value, "lastPosition") &&
        typeof Reflect.get(value, "lastPosition") === "object" &&
        pages.includes(Reflect.get(Reflect.get(value, "lastPosition"), "page") as TGuidePage) &&
        typeof Reflect.get(Reflect.get(value, "lastPosition"), "stepId") === "string" &&
        typeof Reflect.get(Reflect.get(value, "lastPosition"), "closedAt") === "string"
          ? (Reflect.get(value, "lastPosition") as IGuideProgress["lastPosition"])
          : undefined,
      updatedAt:
        typeof Reflect.get(value, "updatedAt") === "string"
          ? String(Reflect.get(value, "updatedAt"))
          : new Date(0).toISOString(),
    }
  } catch {
    return emptyProgress()
  }
}

export const guideRepository = {
  get: read,
  update: ({ welcomeSeen, lastPosition }: IUpdateGuideProgressInput): IGuideProgress => {
    const current = read()
    const updated: IGuideProgress = {
      welcomeSeen: welcomeSeen ?? current.welcomeSeen,
      lastPosition: lastPosition ?? current.lastPosition,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    return updated
  },
}
