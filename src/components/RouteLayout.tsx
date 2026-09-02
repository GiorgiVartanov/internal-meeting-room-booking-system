import { Outlet, useNavigation } from "react-router-dom"

import { AppHeader } from "@/components/AppHeader"
import PageMetadata from "@/components/PageMetadata"
import { PATHS } from "@/constants"
import { DashboardPageSkeleton } from "@/features/dashboard"
import { DocumentationPageSkeleton } from "@/features/documentation"
import { GuideProvider, ModalGuideUrlLauncher } from "@/features/guide"
import { SchedulePageSkeleton } from "@/features/schedule"

const RouteLayout = () => {
  const navigation = useNavigation()

  const loadingPath = navigation.state === "loading" ? navigation.location?.pathname : undefined
  let content = <Outlet />
  if (loadingPath === PATHS.dashboard) content = <DashboardPageSkeleton />
  if (loadingPath === PATHS.documentation) content = <DocumentationPageSkeleton />
  if (loadingPath === PATHS.schedule) content = <SchedulePageSkeleton />

  return (
    <GuideProvider>
      <div className="h-dvh overflow-hidden">
        <PageMetadata />
        <AppHeader />
        <ModalGuideUrlLauncher />
        {content}
      </div>
    </GuideProvider>
  )
}

export default RouteLayout
