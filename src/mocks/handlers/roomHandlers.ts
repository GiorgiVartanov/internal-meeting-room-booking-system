import { http, HttpResponse } from "msw"

import { roomRepository } from "@/mocks/db/repositories"
import { PATHS } from "@/constants"
import { matchesCapacityBuckets } from "@/lib/roomCapacity"
import type { TCapacityBucket } from "@/types"

const capacityBuckets: readonly TCapacityBucket[] = ["1", "2", "4-8", "9-20"]

const isCapacityBucket = (value: string): value is TCapacityBucket =>
  capacityBuckets.some((bucket) => bucket === value)

const listParam = (params: URLSearchParams, key: string) =>
  params.get(key)?.split(",").filter(Boolean) ?? []
const inCapacity = (capacity: number, buckets: TCapacityBucket[]) =>
  matchesCapacityBuckets(capacity, buckets)

export const roomHandlers = [
  http.get(PATHS.mockApi.rooms, ({ request }) => {
    const params = new URL(request.url).searchParams
    const search = params.get("search")?.toLocaleLowerCase()
    const capacities = listParam(params, "capacity").filter(isCapacityBucket)
    const amenities = listParam(params, "amenities")
    const hasAirConditioning = params.get("hasAirConditioning")
    const isAccessible = params.get("isAccessible")

    return HttpResponse.json(
      roomRepository
        .list()
        .filter(
          (room) =>
            room.isActive &&
            (!search ||
              `${room.name.en} ${room.name.ka} ${room.description.en} ${room.description.ka} ${room.capacity}`
                .toLocaleLowerCase()
                .includes(search)) &&
            inCapacity(room.capacity, capacities) &&
            (!amenities.length ||
              amenities.every((amenity) =>
                room.amenities.includes(amenity as (typeof room.amenities)[number])
              )) &&
            (!hasAirConditioning ||
              room.airConditionerCount > 0 === (hasAirConditioning === "true")) &&
            (!isAccessible || room.isAccessible === (isAccessible === "true"))
        )
    )
  }),
  http.get(PATHS.mockApi.roomPattern, ({ params }) => {
    const room = roomRepository.get(String(params.roomId))

    return room
      ? HttpResponse.json(room)
      : HttpResponse.json({ message: "Room not found.", code: "ROOM_NOT_FOUND" }, { status: 404 })
  }),
]
