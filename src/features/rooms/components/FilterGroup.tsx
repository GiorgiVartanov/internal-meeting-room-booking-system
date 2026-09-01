import type { ReactNode } from "react"

interface IProps {
  title: string
  icon: ReactNode
  children: ReactNode
}

/** Groups related room-filter controls under a labeled heading. */
export const FilterGroup = ({ title, icon, children }: IProps) => (
  <fieldset>
    <legend className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {icon}
      {title}
    </legend>
    <div className="flex flex-wrap gap-2">{children}</div>
  </fieldset>
)
