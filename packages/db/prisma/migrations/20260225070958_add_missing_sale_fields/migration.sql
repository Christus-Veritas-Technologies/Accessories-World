/*
  Warnings:

  - You are about to drop the column `address` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `Wholesaler` table. All the data in the column will be lost.
  - Added the required column `name` to the `Wholesaler` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Wholesaler` required. This step will fail if there are existing NULL values in that column.

*/
/*
  Warnings:

  - You are about to drop the column `address` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `Wholesaler` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `Wholesaler` table. All the data in the column will be lost.
  - Added the required column `name` to the `Wholesaler` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Wholesaler` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "productName" TEXT;

-- AlterTable
ALTER TABLE "Wholesaler" DROP COLUMN "address",
DROP COLUMN "approved",
DROP COLUMN "businessName",
DROP COLUMN "contactPerson",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
