// One-off script to seed real reference data (ADUN constituencies), a
// starter set of AidType categories, and a default admin account. Run with:
//   node prisma/seed-reference-data.mjs
//
// The admin password is never hardcoded: set ADMIN_SEED_PASSWORD in your .env
// to choose it, or omit it and the script generates + prints a random one
// (only shown once, only when the account is actually created).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateRandomPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "@$!%*?&";
  const all = upper + lower + digits + special;

  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];
  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const rest = Array.from({ length: 8 }, () => pick(all));

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

const DEFAULT_ADMIN = {
  fullname: "Pentadbir Sistem",
  idNumber: "admin",
  phone: "0000000000",
};

const ADUN_NAMES = [
  "ADUN Ayer Hangat", "ADUN Kuah", "ADUN Kota Siputeh", "ADUN Ayer Hitam",
  "ADUN Bukit Kayu Hitam", "ADUN Jitra", "ADUN Kuala Nerang", "ADUN Pedu",
  "ADUN Bukit Lada", "ADUN Bukit Pinang", "ADUN Derga", "ADUN Suka Menanti",
  "ADUN Kota Darul Aman", "ADUN Alor Mengkudu", "ADUN Anak Bukit",
  "ADUN Kubang Rotan", "ADUN Pengkalan Kundor", "ADUN Tokai",
  "ADUN Sungai Tiang", "ADUN Sungai Limau", "ADUN Gua Chempedak",
  "ADUN Gurun", "ADUN Belantek", "ADUN Jeneri", "ADUN Bukit Selambau",
  "ADUN Tanjong Dawai", "ADUN Pantai Merdeka", "ADUN Bakar Arang",
  "ADUN Sidam", "ADUN Bayu", "ADUN Kupang", "ADUN Kuala Ketil",
  "ADUN Merbau Pulas", "ADUN Lunas", "ADUN Kulim", "ADUN Bandar Baharu",
];

const AID_TYPES = [
  {
    name: "Bantuan Am",
    conditions: "Isi rumah berpendapatan RM3,000 ke bawah.",
    eligibleAge: 18,
    amount: 300,
    description: "Bantuan kewangan am untuk keperluan asas.",
  },
  {
    name: "Bantuan Kesihatan",
    conditions: "Memerlukan rawatan perubatan berterusan.",
    eligibleAge: 0,
    amount: 500,
    description: "Bantuan kos rawatan dan ubat-ubatan.",
  },
  {
    name: "Bantuan Pendidikan",
    conditions: "Pelajar sekolah/IPT dari keluarga B40.",
    eligibleAge: 6,
    amount: 400,
    description: "Bantuan yuran dan keperluan persekolahan.",
  },
  {
    name: "Bantuan OKU",
    conditions: "Pemegang kad OKU sah.",
    eligibleAge: 0,
    amount: 350,
    description: "Bantuan khas untuk golongan OKU.",
  },
  {
    name: "Lain-lain",
    conditions: "Ditentukan mengikut keperluan dan penilaian pegawai.",
    eligibleAge: 0,
    amount: 0,
    description: "Jenis bantuan lain yang tidak disenaraikan di atas — sila nyatakan dalam penerangan.",
  },
];

const [adunResult, aidTypeResult] = await Promise.all([
  prisma.adun.createMany({
    data: ADUN_NAMES.map((name) => ({ name })),
    skipDuplicates: true,
  }),
  prisma.aidType.createMany({
    data: AID_TYPES,
    skipDuplicates: true,
  }),
]);

console.log(`Adun: ${adunResult.count} inserted (skipped existing)`);
console.log(`AidType: ${aidTypeResult.count} inserted (skipped existing)`);

const existingAdmin = await prisma.user.findUnique({ where: { idNumber: DEFAULT_ADMIN.idNumber } });

if (existingAdmin) {
  console.log(`Admin account already exists: idNumber="${DEFAULT_ADMIN.idNumber}" (password unchanged)`);
} else {
  const password = process.env.ADMIN_SEED_PASSWORD || generateRandomPassword();
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      fullname: DEFAULT_ADMIN.fullname,
      idNumber: DEFAULT_ADMIN.idNumber,
      phone: DEFAULT_ADMIN.phone,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin account created: idNumber="${DEFAULT_ADMIN.idNumber}" (id: ${admin.id})`);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(`Generated password (save this now, it will not be shown again): ${password}`);
  }
}

await prisma.$disconnect();
