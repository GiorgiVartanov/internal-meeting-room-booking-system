import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

const Tabs = ({ ...props }: TabsPrimitive.Root.Props) => (
  <TabsPrimitive.Root
    data-slot="tabs"
    {...props}
  />
)
const TabsList = ({ className, ...props }: TabsPrimitive.List.Props) => (
  <TabsPrimitive.List
    data-slot="tabs-list"
    className={cn(
      "relative inline-flex h-8 w-fit items-center overflow-hidden border bg-muted p-0.5 text-muted-foreground",
      className
    )}
    {...props}
  />
)
const TabsIndicator = ({ className, ...props }: TabsPrimitive.Indicator.Props) => (
  <TabsPrimitive.Indicator
    data-slot="tabs-indicator"
    className={cn(
      "absolute left-[var(--active-tab-left)] top-[var(--active-tab-top)] h-[var(--active-tab-height)] w-[var(--active-tab-width)] bg-primary transition-[left,width] duration-300 ease-out",
      className
    )}
    {...props}
  />
)
const TabsTrigger = ({ className, ...props }: TabsPrimitive.Tab.Props) => (
  <TabsPrimitive.Tab
    data-slot="tabs-trigger"
    className={cn(
      "relative z-10 inline-flex h-full min-w-0 flex-1 items-center justify-center border border-transparent px-3 text-xs font-medium outline-none transition-colors duration-300 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring data-active:text-primary-foreground",
      className
    )}
    {...props}
  />
)
const TabsContent = ({ className, ...props }: TabsPrimitive.Panel.Props) => (
  <TabsPrimitive.Panel
    data-slot="tabs-content"
    className={cn("outline-none", className)}
    {...props}
  />
)

export { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger }
