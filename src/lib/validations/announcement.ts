import { z } from "zod";

export const announcementSchema = z.object({
  text: z.string().min(5, "Teks pengumuman mestilah sekurang-kurangnya 5 aksara"),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
