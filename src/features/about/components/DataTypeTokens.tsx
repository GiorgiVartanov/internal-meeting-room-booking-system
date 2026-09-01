import type { ReactElement } from "react"

interface IProps {
  type: string
}

const punctuationClassName = "text-[#393a34] dark:text-[#d4d4d4]"
const stringClassName = "text-[#a31515] dark:text-[#ce9178]"

/** Maps a documented scalar type to its visual token style. */
const typeClassName = (type: string): string => {
  const normalizedType = type.trim()
  if (normalizedType === "number") return "text-[#098658] dark:text-[#b5cea8]"
  if (normalizedType === "boolean") return "text-[#0000ff] dark:text-[#569cd6]"
  if (normalizedType === "undefined") return "text-[#af00db] dark:text-[#c586c0]"
  if (normalizedType === "ISO 8601" || normalizedType === "YYYY-MM-DD")
    return "text-[#267f99] dark:text-[#4ec9b0]"

  return stringClassName
}

const localizedObjectTokens = (type: string): ReactElement | undefined => {
  if (!type.startsWith("{ ") || !type.endsWith(" }")) return undefined

  const members = type.slice(2, -2).split(", ")

  return (
    <>
      <span className={punctuationClassName}>{"{ "}</span>
      {members.map((member, index) => {
        const separatorIndex = member.indexOf(": ")
        const property = member.slice(0, separatorIndex)
        const value = member.slice(separatorIndex + 2)

        return (
          <span key={member}>
            {index > 0 && <span className={punctuationClassName}>, </span>}
            <span className="text-[#001080] dark:text-[#9cdcfe]">{property}</span>
            <span className={punctuationClassName}>: </span>
            <span className={typeClassName(value)}>{value}</span>
          </span>
        )
      })}
      <span className={punctuationClassName}>{" }"}</span>
    </>
  )
}

/** Renders a composite data type as individually styled tokens. */
export const DataTypeTokens = ({ type }: IProps): ReactElement => {
  const objectTokens = localizedObjectTokens(type)
  if (objectTokens) return objectTokens

  return (
    <>
      {type.split("|").map((member, index) => (
        <span key={`${member}-${index}`}>
          {index > 0 && <span className={punctuationClassName}> | </span>}
          <span className={typeClassName(member)}>{member.trim()}</span>
        </span>
      ))}
    </>
  )
}
