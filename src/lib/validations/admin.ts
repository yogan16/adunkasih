import { z } from "zod";
import { passwordSchema } from "./auth";

const ADUN_SCOPED_ROLES = ["PEGAWAI", "WAKIL_ADUN"];

export const createUserSchema = z
  .object({
    fullname: z.string().min(2, "Nama penuh diperlukan"),
    idNumber: z.string().optional(),
    phone: z.string().optional(),
    password: passwordSchema,
    role: z.enum(["CITIZEN", "PEGAWAI", "ADMIN", "WAKIL_ADUN"]),
    adunId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "CITIZEN") {
      if (!data.idNumber || !/^\d{12}$/.test(data.idNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idNumber"],
          message: "No. Kad Pengenalan mestilah 12 digit",
        });
      }
      if (!data.phone || !/^\d{9,11}$/.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Sila masukkan no. telefon yang sah",
        });
      }
    } else if (ADUN_SCOPED_ROLES.includes(data.role)) {
      if (!data.adunId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["adunId"], message: "Sila pilih ADUN" });
      }
    } else if (!data.idNumber || data.idNumber.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idNumber"],
        message: "Username mestilah sekurang-kurangnya 3 aksara",
      });
    }
  });

export const updateUserSchema = z
  .object({
    fullname: z.string().min(2, "Nama penuh diperlukan"),
    phone: z.string().optional(),
    role: z.enum(["CITIZEN", "PEGAWAI", "ADMIN", "WAKIL_ADUN"]),
    password: z.string().optional().or(z.literal("")),
    adunId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "CITIZEN" && (!data.phone || !/^\d{9,11}$/.test(data.phone))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Sila masukkan no. telefon yang sah",
      });
    }
    if (ADUN_SCOPED_ROLES.includes(data.role) && !data.adunId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["adunId"], message: "Sila pilih ADUN" });
    }
    if (data.password && !passwordSchema.safeParse(data.password).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message:
          "Kata laluan mestilah sekurang-kurangnya 6 aksara dan mengandungi huruf besar, huruf kecil, nombor serta aksara khas (@$!%*?&)",
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
