/*
  Warnings:

  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceSent` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `revenue` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Wholesaler` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_customerId_fkey";

-- DropIndex
DROP INDEX "Wholesaler_email_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "customerId",
DROP COLUMN "invoiceSent",
DROP COLUMN "notes",
DROP COLUMN "productName",
DROP COLUMN "profit",
DROP COLUMN "quantity",
DROP COLUMN "revenue",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerWhatsapp" TEXT;

-- AlterTable
ALTER TABLE "Wholesaler" DROP COLUMN "email";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Testimonial";

-- CreateIndex
CREATE UNIQUE INDEX "Wholesaler_phone_key" ON "Wholesaler"("phone");
