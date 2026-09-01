import { BookOpen, CircleAlert, Clock3, Info, LayoutDashboard, Rows3 } from "lucide-react"

export const capabilities = [
  [Rows3, "aboutBookingPageTitle", "aboutBookingPageDescription"],
  [Clock3, "aboutSchedulePageTitle", "aboutSchedulePageDescription"],
  [LayoutDashboard, "aboutDashboardPageTitle", "aboutDashboardPageDescription"],
  [Info, "aboutAboutPageTitle", "aboutAboutPageDescription"],
  [BookOpen, "aboutDocumentationPageTitle", "aboutDocumentationPageDescription"],
  [CircleAlert, "aboutErrorPagesTitle", "aboutErrorPagesDescription"],
] as const

export const aboutSectionIds = [
  "product",
  "capabilities",
  "architecture",
  "principles",
  "models",
  "testing",
  "technologies",
  "codex",
] as const

export const architectureTopics = [
  ["aboutApiStructureTitle", "aboutApiStructureDescription"],
  ["aboutSeedDataTitle", "aboutSeedDataDescription"],
  ["aboutRequestsTitle", "aboutRequestsDescription"],
  ["aboutRulesTitle", "aboutRulesDescription"],
  ["aboutRoutingTitle", "aboutRoutingDescription"],
  ["aboutQualityTitle", "aboutQualityDescription"],
] as const

export const principles = [
  ["url-state", "aboutUrlDecisionTitle", "aboutUrlDecisionDescription"],
  ["mock-backend", "aboutMockDecisionTitle", "aboutMockDecisionDescription"],
  ["availability", "aboutAvailabilityDecisionTitle", "aboutAvailabilityDecisionDescription"],
  ["multiple-rooms", "aboutMultipleRoomsTitle", "aboutMultipleRoomsDescription"],
  ["boundaries", "aboutBoundaryDecisionTitle", "aboutBoundaryDecisionDescription"],
  ["timezone", "aboutTimezoneDecisionTitle", "aboutTimezoneDecisionDescription"],
  ["accessibility", "aboutAccessibilityDecisionTitle", "aboutAccessibilityDecisionDescription"],
  ["documentation", "aboutDocumentationDecisionTitle", "aboutDocumentationDecisionDescription"],
] as const

export const testSuites = [
  ["aboutCreateTestsTitle", "aboutCreateTestsDescription", 2],
  ["aboutUpdateTestsTitle", "aboutUpdateTestsDescription", 1],
  ["aboutSchemaTestsTitle", "aboutSchemaTestsDescription", 3],
  ["aboutOverlapTestsTitle", "aboutOverlapTestsDescription", 4],
  ["aboutRepositoryTestsTitle", "aboutRepositoryTestsDescription", 1],
  ["aboutHolidayTestsTitle", "aboutHolidayTestsDescription", 2],
] as const

export const dataModels = [
  {
    titleKey: "aboutBookingModelTitle",
    descriptionKey: "aboutBookingModelDescription",
    fields: [
      ["id", "string"],
      ["roomId", "string"],
      ["organizerId", "string"],
      ["title", "string"],
      ["startAt", "ISO 8601"],
      ["endAt", "ISO 8601"],
      ["attendeeIds", "string[]"],
      ["notes", "string | undefined"],
      ["status", '"confirmed" | "cancelled"'],
      ["createdAt", "ISO 8601"],
      ["updatedAt", "ISO 8601"],
      ["cancelledAt", "ISO 8601 | undefined"],
    ],
  },
  {
    titleKey: "aboutRoomModelTitle",
    descriptionKey: "aboutRoomModelDescription",
    fields: [
      ["id", "string"],
      ["name", "{ en: string, ka?: string }"],
      ["description", "{ en: string, ka?: string }"],
      ["office", "{ en: string, ka?: string }"],
      ["floor", "number"],
      ["capacity", "number"],
      ["imageUrl", "string"],
      ["amenities", "string[]"],
      ["hasNaturalLight", "boolean"],
      ["lightQuality", '"good" | "professional" | "studio"'],
      ["airConditionerCount", "number"],
      ["isAccessible", "boolean"],
      ["isActive", "boolean"],
    ],
  },
  {
    titleKey: "aboutEmployeeModelTitle",
    descriptionKey: "aboutEmployeeModelDescription",
    fields: [
      ["id", "string"],
      ["name", "{ en: string, ka?: string }"],
      ["department", "{ en: string, ka?: string }"],
      ["email", "string"],
      ["avatarUrl", "string | undefined"],
    ],
  },
  {
    titleKey: "aboutHolidayModelTitle",
    descriptionKey: "aboutHolidayModelDescription",
    fields: [
      ["date", "YYYY-MM-DD"],
      ["name", "{ en: string, ka?: string }"],
      ["countryCode", '"GE"'],
    ],
  },
] as const

export const technologies = [
  ["React", "https://react.dev/", "aboutUseReact"],
  ["TypeScript", "https://www.typescriptlang.org/docs/", "aboutUseTypeScript"],
  ["Vite", "https://vite.dev/guide/", "aboutUseVite"],
  ["Tailwind CSS", "https://tailwindcss.com/docs", "aboutUseTailwind"],
  ["shadcn/ui", "https://ui.shadcn.com/docs", "aboutUseShadcn"],
  ["Base UI", "https://base-ui.com/react/overview/quick-start", "aboutUseBaseUi"],
  ["Lucide React", "https://lucide.dev/guide/packages/lucide-react", "aboutUseLucide"],
  ["React Router", "https://reactrouter.com/", "aboutUseRouter"],
  [
    "TanStack Query",
    "https://tanstack.com/query/latest/docs/framework/react/overview",
    "aboutUseQuery",
  ],
  ["Axios", "https://axios-http.com/docs/intro", "aboutUseAxios"],
  ["MSW", "https://mswjs.io/docs/", "aboutUseMsw"],
  ["React Hook Form", "https://react-hook-form.com/get-started", "aboutUseForm"],
  ["Zod", "https://zod.dev/", "aboutUseZod"],
  ["date-fns", "https://date-fns.org/docs/Getting-Started", "aboutUseDateFns"],
  ["React DayPicker", "https://daypicker.dev/", "aboutUseDayPicker"],
  ["Embla Carousel", "https://www.embla-carousel.com/", "aboutUseEmbla"],
  ["i18next", "https://www.i18next.com/overview/getting-started", "aboutUseI18next"],
  ["Vitest", "https://vitest.dev/guide/", "aboutUseVitest"],
] as const
