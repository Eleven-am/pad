/*
  Warnings:

  - The `series` column on the `chart_blocks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "chart_blocks" DROP COLUMN "series",
ADD COLUMN     "series" TEXT[];
