export const APP_TIME_ZONE = "Etc/GMT-4"
export const MIN_BOOKING_DURATION_MINUTES = 15
export const MAX_BOOKING_DURATION_MINUTES = 6 * 60
export const BOOKING_PAST_GRACE_MINUTES = 60
export const BOOKING_HORIZON_MONTHS = 2
export const WORKING_HOURS = { start: 7, end: 20 } as const
export const BOOKING_SLOT_MINUTES = 15
export const ALLOW_WEEKEND_BOOKINGS = false
export const ALLOW_HOLIDAY_BOOKINGS = false
export const ALLOW_BOOKING_DRAG_AND_RESIZE = true
export const DATA_SCHEMA_VERSION = 15
export const CALENDAR_FUTURE_MONTHS = 3
export const CALENDAR_PAST_MONTHS = 12
export const BOOKING_PAGE_SIZE = 50
export const BOOKING_SEARCH_PAGE_SIZE = 20
export const BOOKING_SEARCH_DEBOUNCE_MILLISECONDS = 350
export const UI_DEBOUNCE_MILLISECONDS = 200
export const TIMELINE_NOW_UPDATE_MILLISECONDS = 60_000

export const DEFAULT_EMPLOYEE_ID = "employee-482701"

export { PATHS } from "./paths"
export { PARAGRAPH_BREAK_PATTERN, TIME_VALUE_PATTERN } from "./regex"
