import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

interface IProps extends AccordionPrimitive.Item.Props {
  className?: string
}

export const AccordionItem = ({ className, ...props }: IProps) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn("not-last:border-b", className)}
    {...props}
  />
)
