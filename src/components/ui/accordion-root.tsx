import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

interface IProps extends AccordionPrimitive.Root.Props {
  className?: string
}

export const Accordion = ({ className, ...props }: IProps) => (
  <AccordionPrimitive.Root
    data-slot="accordion"
    className={cn("flex w-full flex-col", className)}
    {...props}
  />
)
