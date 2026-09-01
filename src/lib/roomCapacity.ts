import type { TCapacityBucket } from "@/types"

export const matchesCapacityBucket = (capacity: number, bucket: TCapacityBucket): boolean => {
  if (bucket === "1") return capacity === 1
  if (bucket === "2") return capacity === 2
  if (bucket === "4-8") return capacity >= 4 && capacity <= 8

  return capacity >= 9 && capacity <= 20
}

export const matchesCapacityBuckets = (
  capacity: number,
  buckets?: readonly TCapacityBucket[]
): boolean => !buckets?.length || buckets.some((bucket) => matchesCapacityBucket(capacity, bucket))
