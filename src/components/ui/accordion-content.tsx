import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

interface IProps extends AccordionPrimitive.Panel.Props {
  className?: string
}

export const AccordionContent = ({ className, children, ...props }: IProps) => (
  <AccordionPrimitive.Panel
    data-slot="accordion-content"
    className="overflow-hidden text-xs data-open:animate-accordion-down data-closed:animate-accordion-up"
    {...props}
  >
    <div
      className={cn(
        "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Panel>
)
