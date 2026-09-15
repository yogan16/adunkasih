import { z } from "zod";

export const advanceStatusSchema = z.object({
  status: z.enum([
    "DOCUMENTS_RECEIVED",
    "APPLICANT_REVIEW",
    "DOCUMENTS_REVIEW",
    "PENDING_APPROVAL",
    "APPROVED",
    "REJECTED",
    "DISBURSED",
  ]),
  note: z.string().max(1000).optional(),
});

export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;
