import { z } from "zod";

export const siteSettingsSchema = z.object({
  email: z.string().email("Sila masukkan alamat email yang sah").or(z.literal("")),
  phone: z.string().regex(/^\d{9,11}$/, "Sila masukkan no. telefon yang sah").or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
