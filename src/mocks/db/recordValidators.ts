import type { IBooking, IEmployee, ILocalizedText, IRoom } from "@/types"

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isLocalizedText = (value: unknown): value is ILocalizedText =>
  isObject(value) &&
  typeof value.en === "string" &&
  (value.ka === undefined || typeof value.ka === "string")

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === "string"

const hasFiniteNumber = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === "number" && Number.isFinite(value[key])

const hasValidTimestamp = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === "string" && Number.isFinite(Date.parse(value[key]))

/** Ensures persisted room records include every field used by room views and filters. */
export const isRoomRecord = (value: unknown): value is IRoom =>
  isObject(value) &&
  hasString(value, "id") &&
  isLocalizedText(value.name) &&
  isLocalizedText(value.description) &&
  isLocalizedText(value.office) &&
  hasFiniteNumber(value, "floor") &&
  hasFiniteNumber(value, "capacity") &&
  hasString(value, "imageUrl") &&
  Array.isArray(value.amenities) &&
  value.amenities.every((amenity) => typeof amenity === "string") &&
  typeof value.hasNaturalLight === "boolean" &&
  hasString(value, "lightQuality") &&
  hasFiniteNumber(value, "airConditionerCount") &&
  typeof value.isAccessible === "boolean" &&
  typeof value.isActive === "boolean"

/** Ensures persisted employee records can safely be used in booking views. */
export const isEmployeeRecord = (value: unknown): value is IEmployee =>
  isObject(value) &&
  hasString(value, "id") &&
  isLocalizedText(value.name) &&
  hasString(value, "email") &&
  isLocalizedText(value.department) &&
  (value.avatarUrl === undefined || typeof value.avatarUrl === "string")

/** Ensures persisted bookings have the fields required by schedules, filters, and dialogs. */
export const isBookingRecord = (value: unknown): value is IBooking =>
  isObject(value) &&
  hasString(value, "id") &&
  hasString(value, "roomId") &&
  hasString(value, "organizerId") &&
  hasString(value, "title") &&
  hasValidTimestamp(value, "startAt") &&
  hasValidTimestamp(value, "endAt") &&
  Array.isArray(value.attendeeIds) &&
  value.attendeeIds.every((attendeeId) => typeof attendeeId === "string") &&
  (value.status === "confirmed" || value.status === "cancelled") &&
  hasValidTimestamp(value, "createdAt") &&
  hasValidTimestamp(value, "updatedAt") &&
  (value.notes === undefined || typeof value.notes === "string") &&
  (value.cancelledAt === undefined ||
    (typeof value.cancelledAt === "string" && Number.isFinite(Date.parse(value.cancelledAt))))
