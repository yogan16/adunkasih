import { z } from "zod";

export const aidTypeSchema = z.object({
  name: z.string().min(2, "Nama jenis bantuan diperlukan"),
  conditions: z.string().min(2, "Syarat kelayakan diperlukan"),
  eligibleAge: z.coerce.number().int().min(0, "Umur mestilah 0 atau lebih"),
  amount: z.coerce.number().min(0, "Jumlah mestilah 0 atau lebih"),
  description: z.string().min(2, "Penerangan diperlukan"),
});

export type AidTypeInput = z.infer<typeof aidTypeSchema>;
