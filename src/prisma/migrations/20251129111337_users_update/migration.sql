/*
  Warnings:

  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pasword_hash` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Users` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `password_hash` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "pasword_hash",
DROP COLUMN "uuid",
ADD COLUMN     "fullName" VARCHAR(255) NOT NULL,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "password_hash" VARCHAR(2040) NOT NULL,
ALTER COLUMN "displayName" DROP NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");
