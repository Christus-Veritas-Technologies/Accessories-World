/*
  Warnings:

  - You are about to drop the column `email` on the `ContactSubmission` table. All the data in the column will be lost.
  - Made the column `phone` on table `ContactSubmission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContactSubmission" DROP COLUMN "email",
ALTER COLUMN "phone" SET NOT NULL;
