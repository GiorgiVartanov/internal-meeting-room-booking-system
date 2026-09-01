import { Button } from "@/components/ui/button"

interface IProps<TValue extends string> {
  title: string
  values: TValue[]
  selected: string | null
  label: (value: TValue) => string
  onSelect: (value: TValue) => void
}

/** Renders an accessible group of toggle buttons for a typed filter value. */
export const FilterButtons = <TValue extends string>({
  title,
  values,
  selected,
  label,
  onSelect,
}: IProps<TValue>) => (
  <fieldset>
    <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </legend>
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Button
          type="button"
          size="sm"
          variant={selected === value ? "default" : "outline"}
          key={value}
          onClick={() => onSelect(value)}
        >
          {label(value)}
        </Button>
      ))}
    </div>
  </fieldset>
)
