/*
  Warnings:

  - The `image` column on the `Album` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `image` column on the `Single` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;

-- AlterTable
ALTER TABLE "Single" DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;
