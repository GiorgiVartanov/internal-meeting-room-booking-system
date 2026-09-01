import { Toaster as Sonner, type ToasterProps } from "sonner"

interface IProps extends ToasterProps {
  className?: string
}

const Toaster = ({ ...props }: IProps) => (
  <Sonner
    theme="system"
    position="bottom-right"
    richColors
    closeButton
    {...props}
  />
)

export { Toaster }
