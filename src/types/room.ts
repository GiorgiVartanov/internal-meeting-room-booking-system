export type TRoomId = string
export type TLanguage = "en" | "ka"
export interface ILocalizedText {
  en: string
  ka?: string
}
export type TCapacityBucket = "1" | "2" | "4-8" | "9-20"
export type TRoomAmenity =
  "display" | "whiteboard" | "video-conference" | "speakerphone" | "standing-desk"
export type TRoomLightQuality = "good" | "professional" | "studio"

export interface IRoom {
  id: TRoomId
  name: ILocalizedText
  description: ILocalizedText
  office: ILocalizedText
  floor: number
  capacity: number
  imageUrl: string
  amenities: TRoomAmenity[]
  hasNaturalLight: boolean
  lightQuality: TRoomLightQuality
  airConditionerCount: number
  isAccessible: boolean
  isActive: boolean
}

export interface IRoomFilters {
  search?: string
  capacity?: TCapacityBucket[]
  amenities?: TRoomAmenity[]
  hasAirConditioning?: boolean
  isAccessible?: boolean
}
