import { createElement } from "react"
import { createBrowserRouter } from "react-router-dom"

import RouteLayout from "@/components/RouteLayout"
import ErrorPage from "@/pages/Error.page"
import { PATHS } from "@/constants"

export const router = createBrowserRouter([
  {
    element: createElement(RouteLayout),
    errorElement: createElement(ErrorPage),
    children: [
      {
        path: PATHS.home,
        lazy: () => import("@/pages/Home.page").then((module) => ({ Component: module.default })),
      },
      {
        path: PATHS.dashboard,
        lazy: () =>
          import("@/pages/Dashboard.page").then((module) => ({ Component: module.default })),
      },
      {
        path: PATHS.schedule,
        lazy: () =>
          import("@/pages/Schedule.page").then((module) => ({ Component: module.default })),
      },
      {
        path: PATHS.documentation,
        lazy: () =>
          import("@/pages/Documentation.page").then((module) => ({ Component: module.default })),
      },
      {
        path: PATHS.about,
        lazy: () => import("@/pages/About.page").then((module) => ({ Component: module.default })),
      },
      {
        path: PATHS.notFound,
        lazy: () =>
          import("@/pages/NotFound.page").then((module) => ({ Component: module.default })),
      },
    ],
  },
])
