import type { WeekNumberProps } from "react-day-picker"

interface IProps extends WeekNumberProps {
  children?: WeekNumberProps["children"]
}

export const CalendarWeekNumber = ({ children, ...props }: IProps) => (
  <td {...props}>
    <div className="flex size-(--cell-size) items-center justify-center text-center">
      {children}
    </div>
  </td>
)
