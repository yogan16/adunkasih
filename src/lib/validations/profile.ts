import { z } from "zod";
import { passwordSchema } from "./auth";

export const profileUpdateSchema = z
  .object({
    fullname: z.string().min(2, "Nama penuh diperlukan"),
    phone: z.string().regex(/^\d{9,11}$/, "Sila masukkan no. telefon yang sah"),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Sila masukkan kata laluan semasa untuk menukar kata laluan",
    path: ["currentPassword"],
  })
  .refine((data) => !data.newPassword || passwordSchema.safeParse(data.newPassword).success, {
    message: "Kata laluan baharu mestilah sekurang-kurangnya 6 aksara dan mengandungi huruf besar, huruf kecil, nombor serta aksara khas (@$!%*?&)",
    path: ["newPassword"],
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
