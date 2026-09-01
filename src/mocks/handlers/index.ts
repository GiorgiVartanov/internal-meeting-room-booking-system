import { bookingHandlers } from "./bookingHandlers"
import { roomHandlers } from "./roomHandlers"
import { calendarHandlers } from "./calendarHandlers"
import { guideHandlers } from "./guideHandlers"

export const handlers = [...roomHandlers, ...bookingHandlers, ...calendarHandlers, ...guideHandlers]
