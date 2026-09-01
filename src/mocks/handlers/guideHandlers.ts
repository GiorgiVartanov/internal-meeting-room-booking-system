import { http, HttpResponse } from "msw"
import { z } from "zod"

import { guideRepository } from "@/mocks/db/guideRepository"
import { PATHS } from "@/constants"

const updateSchema = z
  .object({
    welcomeSeen: z.boolean().optional(),
    lastPosition: z
      .object({
        page: z.enum(["booking", "schedule", "dashboard"]),
        stepId: z.string().min(1),
        closedAt: z.iso.datetime(),
      })
      .optional(),
  })
  .strict()

export const guideHandlers = [
  http.get(PATHS.mockApi.guideProgress, () => HttpResponse.json(guideRepository.get())),
  http.patch(PATHS.mockApi.guideProgress, async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json(
        { message: "The request body must be valid JSON.", code: "INVALID_JSON" },
        { status: 400 }
      )
    }
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success)
      return HttpResponse.json(
        { message: "Invalid guide progress.", code: "INVALID_GUIDE_PROGRESS" },
        { status: 422 }
      )

    return HttpResponse.json(guideRepository.update(parsed.data))
  }),
]
