import { DATA_SCHEMA_VERSION } from "@/constants"

const STORAGE_PREFIX = `meeting-room-booking:v${DATA_SCHEMA_VERSION}`
const PREVIOUS_STORAGE_PREFIX = "meeting-room-booking:v13"
const RESEEDED_COLLECTIONS = new Set(["rooms"])
const collectionCache = new Map<string, unknown[]>()

export const readCollection = <T>(key: string, seed: T[]): T[] => {
  const storageKey = `${STORAGE_PREFIX}:${key}`
  const cached = collectionCache.get(storageKey)
  if (cached) return cached as T[]
  const stored =
    localStorage.getItem(storageKey) ??
    (RESEEDED_COLLECTIONS.has(key)
      ? null
      : localStorage.getItem(`${PREVIOUS_STORAGE_PREFIX}:${key}`))

  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error("Stored collection is not an array")
      const records = parsed as T[]
      localStorage.setItem(storageKey, stored)
      collectionCache.set(storageKey, records)

      return records
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  const records = structuredClone(seed)
  localStorage.setItem(storageKey, JSON.stringify(records))
  collectionCache.set(storageKey, records)

  return records
}

export const writeCollection = <T>(key: string, records: T[]) => {
  const storageKey = `${STORAGE_PREFIX}:${key}`
  localStorage.setItem(storageKey, JSON.stringify(records))
  collectionCache.set(storageKey, records)
}
