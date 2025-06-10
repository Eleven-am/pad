/*
  Warnings:

  - Added the required column `comments` to the `instagram_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likes` to the `instagram_blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "instagram_blocks" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "comments" INTEGER NOT NULL,
ADD COLUMN     "likes" INTEGER NOT NULL;
