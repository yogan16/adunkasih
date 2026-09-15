import { z } from "zod";

export const dependentSchema = z.object({
  name: z.string().min(1, "Nama diperlukan"),
  icNumber: z.string().optional(),
  relationship: z.string().min(1, "Hubungan diperlukan"),
  income: z.number().min(0),
});

export const permohonanSchema = z.object({
  gender: z.enum(["Lelaki", "Perempuan"], { message: "Sila pilih jantina" }),
  occupation: z.string().min(1, "Pekerjaan diperlukan"),
  incomeRange: z.string().min(1, "Sila pilih pendapatan kasar"),
  maritalStatus: z.string().min(1, "Sila pilih status perkahwinan"),
  address: z.string().min(1, "Alamat diperlukan"),
  postcode: z.string().min(1, "Poskod diperlukan"),
  city: z.string().min(1, "Bandar diperlukan"),
  adunId: z.string().min(1, "Sila pilih ADUN"),
  aidTypeId: z.string().min(1, "Sila pilih jenis bantuan"),
  otherAidDetail: z.string().optional(),
  description: z.string().min(1, "Penerangan bantuan diperlukan"),
  dependents: z.array(dependentSchema).default([]),
  hasMykadFile: z.literal(true, {
    message: "Sila muat naik salinan MyKad",
  }),
});

export type PermohonanInput = z.infer<typeof permohonanSchema>;
