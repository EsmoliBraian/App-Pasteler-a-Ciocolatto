-- AlterEnum
ALTER TYPE "ProductType" ADD VALUE 'TOPPING';

-- AlterEnum
ALTER TYPE "QuoteItemType" ADD VALUE 'TOPPING';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "sizeId" TEXT,
ADD COLUMN     "sizeMultiplier" DECIMAL(6,4),
ADD COLUMN     "sizeName" TEXT;

-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "multiplier" DECIMAL(6,4) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
