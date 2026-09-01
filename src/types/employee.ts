import type { TEmployeeId } from "./booking"
import type { ILocalizedText } from "./room"

export interface IEmployee {
  id: TEmployeeId
  name: ILocalizedText
  email: string
  department: ILocalizedText
  avatarUrl?: string
}
