-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'WAKIL_ADUN';

-- CreateTable
CREATE TABLE "AdunBudget" (
    "id" TEXT NOT NULL,
    "adunId" TEXT NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdunBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdunBudget_adunId_key" ON "AdunBudget"("adunId");

-- AddForeignKey
ALTER TABLE "AdunBudget" ADD CONSTRAINT "AdunBudget_adunId_fkey" FOREIGN KEY ("adunId") REFERENCES "Adun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
