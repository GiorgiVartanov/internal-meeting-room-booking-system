// @vitest-environment jsdom

import { render, renderHook, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { describe, expect, it, vi } from "vitest"

import "@/i18n"

import { BookingEditor } from "@/features/schedule"
import type { TBookingForm } from "@/features/schedule/utils"

const defaultValues: TBookingForm = {
  title: "",
  start: "09:00",
  end: "09:15",
  notes: "",
}

describe("booking creation editor", () => {
  it("keeps creation disabled until a title is entered", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(values: TBookingForm) => Promise<void>>()
    const { result } = renderHook(() => useForm<TBookingForm>({ defaultValues }))

    render(
      <BookingEditor
        form={result.current}
        editing={false}
        blocked={false}
        pending={false}
        onSubmit={onSubmit}
        onStopEditing={vi.fn()}
      />
    )

    const createButton = screen.getByRole("button", { name: "Create booking" })
    expect(createButton).toBeDisabled()

    await user.type(screen.getByLabelText("Booking title"), "Product planning")

    expect(createButton).toBeEnabled()
  })

  it("submits the booking draft through the creation form", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(values: TBookingForm) => Promise<void>>().mockResolvedValue(undefined)
    const { result } = renderHook(() => useForm<TBookingForm>({ defaultValues }))

    render(
      <BookingEditor
        form={result.current}
        editing={false}
        blocked={false}
        pending={false}
        onSubmit={onSubmit}
        onStopEditing={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("Booking title"), "Product planning")
    await user.type(screen.getByLabelText("Notes"), "Review the launch checklist")
    await user.click(screen.getByRole("button", { name: "Create booking" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          title: "Product planning",
          start: "09:00",
          end: "09:15",
          notes: "Review the launch checklist",
        },
        expect.anything()
      )
    )
  })
})
