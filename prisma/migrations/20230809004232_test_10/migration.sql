/*
  Warnings:

  - You are about to drop the column `image_src` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `image_src` on the `Track` table. All the data in the column will be lost.
  - Added the required column `index` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Album_location_key";

-- AlterTable
ALTER TABLE "Album" DROP COLUMN "image_src",
DROP COLUMN "location",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "image_src",
ADD COLUMN     "index" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Single" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,

    CONSTRAINT "Single_pkey" PRIMARY KEY ("id")
);
