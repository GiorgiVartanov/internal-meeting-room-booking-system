import { cn } from "@/lib/utils"

interface IProps extends React.ComponentProps<"div"> {
  className?: string
}

function Skeleton({ className, ...props }: IProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-none bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
