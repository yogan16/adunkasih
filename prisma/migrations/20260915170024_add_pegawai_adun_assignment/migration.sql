-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adunId" TEXT;

-- CreateIndex
CREATE INDEX "User_adunId_idx" ON "User"("adunId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adunId_fkey" FOREIGN KEY ("adunId") REFERENCES "Adun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
