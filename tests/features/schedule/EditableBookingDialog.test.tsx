// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { addDays, isWeekend } from "date-fns"
import { describe, expect, it, vi } from "vitest"

import "@/i18n"

import { DEFAULT_EMPLOYEE_ID } from "@/constants"
import { EditableBookingDialog } from "@/features/schedule"
import { appCalendarDate, dateKey, fromDateAndTime } from "@/lib/date"
import type { IBooking, IRoom, IUpdateBookingInput } from "@/types"

const room: IRoom = {
  id: "room-sommen",
  name: { en: "Sommen" },
  description: { en: "A focused meeting room" },
  office: { en: "Tbilisi" },
  floor: 2,
  capacity: 1,
  imageUrl: "/rooms/sommen.webp",
  amenities: ["display"],
  hasNaturalLight: true,
  lightQuality: "professional",
  airConditionerCount: 1,
  isAccessible: true,
  isActive: true,
}

const nextBookableDate = (): string => {
  let date = addDays(appCalendarDate(), 1)
  while (isWeekend(date)) date = addDays(date, 1)

  return dateKey(date)
}

describe("booking update dialog", () => {
  it("submits changed booking fields through the update form", async () => {
    const user = userEvent.setup()
    const date = nextBookableDate()
    const booking: IBooking = {
      id: "booking-update-test",
      roomId: room.id,
      organizerId: DEFAULT_EMPLOYEE_ID,
      title: "Planning",
      startAt: fromDateAndTime(date, "09:00"),
      endAt: fromDateAndTime(date, "10:00"),
      attendeeIds: [],
      notes: "Initial notes",
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const onSave = vi.fn<(changes: IUpdateBookingInput) => Promise<void>>().mockResolvedValue()

    render(
      <EditableBookingDialog
        booking={booking}
        rooms={[room]}
        bookings={[booking]}
        employees={[]}
        holidays={[]}
        open
        pending={false}
        onSave={onSave}
        onOpenChange={vi.fn()}
      />
    )

    const title = await screen.findByLabelText("Booking title")
    await user.clear(title)
    await user.type(title, "Updated planning")
    await user.clear(screen.getByLabelText("Notes"))
    await user.type(screen.getByLabelText("Notes"), "Updated notes")
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        roomId: room.id,
        title: "Updated planning",
        notes: "Updated notes",
        attendeeIds: [],
        startAt: fromDateAndTime(date, "09:00"),
        endAt: fromDateAndTime(date, "10:00"),
      })
    )
  })
})
