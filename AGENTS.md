# Internal Meeting Room Booking System

## Product goal

Build a responsive internal React application where employees can discover meeting rooms, understand availability, and create, inspect, edit, search, filter, and cancel bookings. There is no real backend: initial records come from local JSON and MSW exposes them through an HTTP-shaped API backed by browser storage. Keep the UI independent of both JSON and storage so a real API can replace MSW later.

## Required technology

- React 19, TypeScript, and Vite.
- Tailwind CSS v4 and shadcn/ui (`base-lyra`, `mist`, CSS variables) for styling and accessible primitives.
- Lucide React for icons; do not hand-draw SVG icons when Lucide provides one.
- Axios through `src/api/api.ts` for every application request.
- TanStack Query for server-state fetching, mutations, invalidation, and request status.
- MSW for the mock API and `localStorage` for persistent user changes.
- React Router for routes and URL-backed state.
- date-fns for date arithmetic, comparison, and formatting.
- React Hook Form with Zod schemas and `@hookform/resolvers` for booking forms and validation.
- shadcn's Embla-based Carousel for room navigation.
- Install and use shadcn components whenever an appropriate primitive exists (for example Carousel, Drawer/Sheet, Dialog, Calendar, Slider, Skeleton, Form, Input, Select, and Alert) instead of recreating those controls locally. Add components incrementally with the shadcn CLI as features need them.
- When discovering or installing shadcn components, use the [shadcn MCP server documentation](https://ui.shadcn.com/docs/mcp) as the integration reference.

Do not add a competing component, icon, HTTP, server-state, form, schema, or date library without a documented reason.

## Application requirements

### Main room schedule

- Present meeting rooms as a carousel, with the selected room encoded in the URL.
- Show a searchable/filterable room navigation sidebar on the right. Its filters belong in URL search parameters.
- Show a vertically scrollable timeline on the left for the selected room. Search accepts a booking name or time.
- Provide weekday/date buttons, previous/next week controls, and a button opening a large calendar dialog.
- Let users select an available time and create a named booking lasting from 15 minutes through 6 hours.
- Preserve the selected date, booking draft, and applicable filters when switching rooms.
- Users may cancel active or upcoming bookings, but never bookings that have ended.

### Dashboard

- Summarize the current state of rooms and bookings and provide a large calendar.
- Selecting a date opens a scrollable drawer listing rooms and their availability/bookings.
- Selecting a room in that drawer shows its details and a link to the main schedule with that room selected.

### Rooms

- Provide sufficient decision-making information, search, and filters.
- Room data includes capacity, equipment/amenities, lighting availability, air-conditioner count/availability, and light quality (`good`, `professional`, or `studio`).

### Bookings and calendar

- Support daily and weekly schedules, clearly showing availability and existing bookings.
- Support booking details, creation, editing of upcoming bookings, cancellation under the time rule above, search, and filters.
- Booking records must contain a room, organizer/employee, title, start/end timestamps, attendees, and optional notes.
- Prevent overlapping bookings for a room.

## Business rules and constants

- Centralize mutable policy in `src/constants/`; never scatter policy numbers through components or handlers.
- Include constants for the 15-minute minimum duration, 6-hour maximum duration, booking horizon, past-time grace, working hours, slot interval, weekend booking policy, and holiday booking policy.
- A booking may start from one hour before the current time through two months in the future. Treat the one-hour allowance as an explicit product rule and validate it consistently in the UI and MSW.
- Georgian public holidays appear on calendars. Weekends and Georgian public holidays are non-bookable by default; both restrictions must be controlled independently by constants.
- Use ISO 8601 timestamps in data/API models. Perform comparisons as instants and display dates/times in the configured application timezone.

## Data and mock API architecture

- Put seed data in local JSON files under `src/mocks/data/`, with realistic rooms, employees, bookings, and Georgian holidays.
- Seed bookings across roughly two months before early September, with high density in the first target week, lower density in the second, and very few in the final week.
- Organize MSW as `src/mocks/browser.ts`, `src/mocks/handlers/index.ts`, resource handler files, `src/mocks/db/` storage/repository helpers, and `src/mocks/data/` seed JSON.
- Initialize local storage once from JSON when no stored dataset/schema version exists. All later writes go through the repository layer and persist across refreshes.
- Handlers own HTTP concerns and call repository/domain helpers. They must validate input, return useful error bodies/status codes, and enforce booking windows, blocked days, duration, and overlap rules.
- Start the MSW browser worker only in development before rendering React. Keep production deployability in mind; if the deployed demo uses MSW, enable it via an explicit environment flag.
- Components never import mock handlers, JSON, storage helpers, or Axios directly. They consume query/mutation hooks that call resource functions in `src/api/`.

## API conventions

- Keep the shared Axios wrapper in `src/api/api.ts` and export resource functions through barrel files.
- Use REST-shaped endpoints such as `/rooms`, `/rooms/:roomId`, `/bookings`, `/bookings/:bookingId`, `/employees`, and `/holidays`.
- Resource functions accept one object argument when more than one value is needed. Define query params separately from request bodies.
- Suggested operations: list/get rooms, list/get bookings, get a room schedule, create/edit/cancel a booking, and list employees/holidays.
- Pass filters through Axios `config.params`; use POST to create, PATCH to edit, and DELETE to cancel unless a documented soft-delete model is chosen.
- Return typed domain DTOs from API functions. Convert Axios/MSW errors to a consistent API error shape before displaying them.

## TypeScript conventions

- Prefix interfaces with `I` and type aliases with `T` (for example `IRoom`, `IBooking`, `TRoomId`, `TBookingStatus`).
- Prefer interfaces for object/domain contracts and type aliases for unions, primitives, mapped types, and function signatures.
- Use branded/string ID aliases where helpful and avoid `any`, TypeScript enums, non-null assertions, and unsafe casts.
- Keep domain types in `src/types/`, grouped by resource and exported from `src/types/index.ts`.
- Define separate input types for create/edit operations; do not accept server-owned fields such as IDs or timestamps from forms.
- Model filters explicitly so URL parsing, API calls, and query keys use the same vocabulary.
- Use `import type` for type-only imports and satisfy the repository's strict unused-code checks.
- Keep exactly one React component per source file, including pages, features, layouts, and shared/UI primitives. Colocate non-component helpers only when they are private to that component.
- Name a non-exported component props interface `IProps`. Exported props contracts may use a descriptive `I<ComponentName>Props` name.
- Every component that accepts props must use a named props interface; never declare an inline object type in the component signature.
- Destructure component props in the function parameter. Do not accept a `props` object and read fields from it inside the component.
- Keep regular source files at or below 200 lines. Exceed that limit only when splitting tightly coupled code would materially reduce clarity, and document the exception near the implementation or in `README.md`.
- Keep regular-expression literals in `src/constants/regex.ts` and import them where needed.

## URL state

- Routes should cover the dashboard, rooms, main schedule, and booking details where appropriate.
- Put shareable navigation state in pathname/search parameters: selected room/date/view, room search and filters, booking search and filters, and relevant drawer/dialog selection.
- Parse and validate URL values at the route boundary, apply defaults for invalid/missing values, and avoid duplicating URL state in component state.
- Keep transient presentation state local when it is not useful in a refreshable/shareable URL.

## UI and accessibility

- Build responsive layouts that remain usable on mobile, tablet, and desktop; sidebars may become shadcn Sheets/Drawers on smaller screens.
- Use shadcn primitives through `@/components/ui`, compose application components separately, and use the `cn` helper for conditional classes.
- Every interactive control needs a visible label or accessible name, keyboard operation, visible focus, and appropriate loading/empty/error/disabled feedback.
- Use native semantic controls such as `button` instead of assigning interactive roles to non-interactive elements.
- Never rely on color alone to communicate availability or booking status.

## Quality bar

- Every React component and every custom hook must live in its own file. A file may never declare
  two components, two custom hooks, or combine a component with a custom hook. Shared non-React
  helpers and types must be moved to dedicated utility/type files, and barrel files may only
  re-export declarations.
- Keep files focused and colocate feature-specific hooks/components where practical; avoid large page components containing data access and business rules.
- Do not declare React components inside other components. Move them to their own files and pass required data as props.
- Avoid nested ternary expressions. Resolve multi-branch rendering or labels in named variables, helpers, or explicit `if` statements.
- Consolidate imports from the same module, and keep all CSS `@import` rules before other statements.
- Skeletons must mirror the final UI's geometry, cover only the unavailable dynamic region, and be omitted when preserving the stable shell gives clearer feedback.
- Configure and run Prettier with one JSX/HTML attribute or prop per line.
- Make TanStack Query keys deterministic and include every filter that affects the response. Invalidate or update all affected room, schedule, dashboard, and booking queries after mutations.
- Test business-rule helpers and MSW handlers, especially boundary times, weekends/holidays, overlap detection, persistence, and edit/cancel restrictions.
- Before completing a change, run `npm run lint` and `npm run build`. Add focused tests when a test runner is introduced.
- Record meaningful assumptions and trade-offs in `README.md`, and keep the application suitable for deployment to Vercel or equivalent static hosting.
