import { z } from "zod";

export const loginSchema = z.object({
  idNumber: z.string().min(1, "No. Kad Pengenalan diperlukan"),
  password: z.string().min(1, "Kata laluan diperlukan"),
});

export const passwordSchema = z
  .string()
  .min(6, "Kata laluan mestilah sekurang-kurangnya 6 aksara")
  .regex(/[a-z]/, "Kata laluan mestilah mengandungi huruf kecil")
  .regex(/[A-Z]/, "Kata laluan mestilah mengandungi huruf besar")
  .regex(/\d/, "Kata laluan mestilah mengandungi nombor")
  .regex(/[@$!%*?&]/, "Kata laluan mestilah mengandungi aksara khas (@$!%*?&)");

export const registerSchema = z.object({
  fullname: z.string().min(2, "Nama penuh diperlukan"),
  idNumber: z
    .string()
    .regex(/^\d{12}$/, "No. Kad Pengenalan mestilah 12 digit"),
  phone: z
    .string()
    .regex(/^\d{9,11}$/, "Sila masukkan no. telefon yang sah"),
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
