import type { TGuidePage } from "@/types"
import { PATHS } from "@/constants"

export interface IGuideStep {
  id: string
  titleKey: string
  descriptionKey: string
  selector: string
  documentationSection: string
}

export interface IGuidePageDefinition {
  labelKey: string
  path: string
  steps: IGuideStep[]
}

export const guidePages: Record<TGuidePage, IGuidePageDefinition> = {
  booking: {
    labelKey: "guideBookingLabel",
    path: PATHS.home,
    steps: [
      {
        id: "date",
        titleKey: "guideBookingDateTitle",
        descriptionKey: "guideBookingDateDescription",
        selector: '[data-guide="booking-time-controls"]',
        documentationSection: "booking-time",
      },
      {
        id: "time-selection",
        titleKey: "guideBookingTimeTitle",
        descriptionKey: "guideBookingTimeDescription",
        selector: '[data-guide="booking-timeline"]',
        documentationSection: "booking-time-selection",
      },
      {
        id: "filters",
        titleKey: "guideBookingFiltersTitle",
        descriptionKey: "guideBookingFiltersDescription",
        selector: '[data-guide="room-filters"]',
        documentationSection: "booking-filters",
      },
      {
        id: "room",
        titleKey: "guideBookingRoomTitle",
        descriptionKey: "guideBookingRoomDescription",
        selector: '[data-guide="room-details"]',
        documentationSection: "booking-room",
      },
      {
        id: "any-room",
        titleKey: "guideBookingAnyRoomTitle",
        descriptionKey: "guideBookingAnyRoomDescription",
        selector: '[data-guide="any-room"]',
        documentationSection: "booking-any-room",
      },
      {
        id: "search",
        titleKey: "guideBookingSearchTitle",
        descriptionKey: "guideBookingSearchDescription",
        selector: '[data-guide="booking-search"]',
        documentationSection: "booking-search",
      },
      {
        id: "editor",
        titleKey: "guideBookingEditorTitle",
        descriptionKey: "guideBookingEditorDescription",
        selector: '[data-guide="booking-editor"]',
        documentationSection: "booking-create",
      },
    ],
  },
  schedule: {
    labelKey: "guideScheduleLabel",
    path: PATHS.schedule,
    steps: [
      {
        id: "week-navigation",
        titleKey: "guideScheduleWeeksTitle",
        descriptionKey: "guideScheduleWeeksDescription",
        selector: '[data-guide="week-navigation"]',
        documentationSection: "schedule-weeks",
      },
      {
        id: "personal-timeline",
        titleKey: "guideScheduleTimelineTitle",
        descriptionKey: "guideScheduleTimelineDescription",
        selector: '[data-guide="personal-timeline-overview"]',
        documentationSection: "schedule-timeline",
      },
      {
        id: "reschedule",
        titleKey: "guideScheduleEditingTitle",
        descriptionKey: "guideScheduleEditingDescription",
        selector: '[data-guide="personal-reschedule"]',
        documentationSection: "schedule-editing",
      },
    ],
  },
  dashboard: {
    labelKey: "guideDashboardLabel",
    path: PATHS.dashboard,
    steps: [
      {
        id: "calendar",
        titleKey: "guideDashboardCalendarTitle",
        descriptionKey: "guideDashboardCalendarDescription",
        selector: '[data-guide="dashboard-calendar"]',
        documentationSection: "dashboard-calendar",
      },
      {
        id: "rooms-tab",
        titleKey: "guideDashboardRoomsTitle",
        descriptionKey: "guideDashboardRoomsDescription",
        selector: '[data-guide="dashboard-rooms-tab"]',
        documentationSection: "dashboard-rooms",
      },
      {
        id: "bookings-tab",
        titleKey: "guideDashboardBookingsTitle",
        descriptionKey: "guideDashboardBookingsDescription",
        selector: '[data-guide="dashboard-bookings-tab"]',
        documentationSection: "dashboard-bookings",
      },
      {
        id: "mine-filter",
        titleKey: "guideDashboardFilterTitle",
        descriptionKey: "guideDashboardFilterDescription",
        selector: '[data-guide="dashboard-mine-filter"]',
        documentationSection: "dashboard-filter",
      },
    ],
  },
}

/** Maps an application pathname to the guide page that documents it. */
export const guidePageForPath = (path: string): TGuidePage => {
  if (path.startsWith(PATHS.schedule)) return "schedule"
  if (path.startsWith(PATHS.dashboard)) return "dashboard"

  return "booking"
}
