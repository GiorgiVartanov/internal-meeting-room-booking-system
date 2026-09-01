import { useState } from "react"

import { Slider } from "@/components/ui/slider"

interface IProps {
  value: number
  label: string
  onCommit: (value: number) => void
}

/** Selects an attendee count within the room's supported capacity. */
export const PeopleCountSlider = ({ value, label, onCommit }: IProps) => {
  const [draft, setDraft] = useState(value)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <output className="font-mono text-xs font-semibold">{draft}</output>
      </div>
      <Slider
        key={value}
        aria-label={label}
        defaultValue={[value]}
        min={1}
        max={20}
        step={1}
        onValueChange={(nextValue) => {
          const next = Array.isArray(nextValue) ? nextValue[0] : nextValue
          if (typeof next === "number") setDraft(next)
        }}
        onValueCommitted={(nextValue) => {
          const next = Array.isArray(nextValue) ? nextValue[0] : nextValue
          if (typeof next === "number") onCommit(next)
        }}
        aria-valuetext={String(draft)}
      />
    </div>
  )
}
