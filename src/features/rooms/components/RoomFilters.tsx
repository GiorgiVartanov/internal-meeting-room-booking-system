import { Accessibility, AirVent, Monitor, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import type { IRoomFilters, TCapacityBucket, TRoomAmenity } from "@/types"

import { FilterGroup } from "./FilterGroup"

interface IProps {
  filters: IRoomFilters
  onChange: (filters: IRoomFilters) => void
}

/** Adds or removes one value from a multi-select room filter. */
const toggle = <T extends string>(values: T[] | undefined, value: T) =>
  values?.includes(value) ? values.filter((item) => item !== value) : [...(values ?? []), value]

/** Renders the capacity, amenity, lighting, and accessibility room filters. */
export const RoomFilters = ({ filters, onChange }: IProps) => {
  const { t } = useTranslation()

  const capacities: TCapacityBucket[] = ["1", "2", "4-8", "9-20"]
  const amenities: TRoomAmenity[] = [
    "display",
    "whiteboard",
    "video-conference",
    "speakerphone",
    "standing-desk",
  ]

  return (
    <div className="space-y-5">
      <FilterGroup
        title={t("capacity")}
        icon={<Users className="size-4" />}
      >
        {capacities.map((value) => (
          <Button
            type="button"
            variant={filters.capacity?.includes(value) ? "default" : "outline"}
            key={value}
            className="h-8 px-3 text-xs"
            aria-pressed={Boolean(filters.capacity?.includes(value))}
            onClick={() => onChange({ ...filters, capacity: toggle(filters.capacity, value) })}
          >
            {value}
          </Button>
        ))}
      </FilterGroup>
      <FilterGroup
        title={t("amenities")}
        icon={<Monitor className="size-4" />}
      >
        {amenities.map((value) => (
          <Button
            type="button"
            variant={filters.amenities?.includes(value) ? "default" : "outline"}
            key={value}
            className="h-8 px-3 text-xs"
            aria-pressed={Boolean(filters.amenities?.includes(value))}
            onClick={() => onChange({ ...filters, amenities: toggle(filters.amenities, value) })}
          >
            {t(value)}
          </Button>
        ))}
      </FilterGroup>
      <FilterGroup
        title={t("roomFeatures")}
        icon={<AirVent className="size-4" />}
      >
        <Button
          type="button"
          variant={filters.hasAirConditioning ? "default" : "outline"}
          className="h-8 px-3 text-xs"
          aria-pressed={Boolean(filters.hasAirConditioning)}
          onClick={() =>
            onChange({
              ...filters,
              hasAirConditioning: filters.hasAirConditioning ? undefined : true,
            })
          }
        >
          <AirVent />
          {t("airConditioning")}
        </Button>
        <Button
          type="button"
          variant={filters.isAccessible ? "default" : "outline"}
          className="h-8 px-3 text-xs"
          aria-pressed={Boolean(filters.isAccessible)}
          onClick={() =>
            onChange({ ...filters, isAccessible: filters.isAccessible ? undefined : true })
          }
        >
          <Accessibility />
          {t("accessible")}
        </Button>
      </FilterGroup>
    </div>
  )
}
