export type TGuidePage = "booking" | "schedule" | "dashboard"

export interface IGuideProgress {
  welcomeSeen: boolean
  lastPosition?: {
    page: TGuidePage
    stepId: string
    closedAt: string
  }
  updatedAt: string
}

export interface IUpdateGuideProgressInput {
  welcomeSeen?: boolean
  lastPosition?: IGuideProgress["lastPosition"]
}
