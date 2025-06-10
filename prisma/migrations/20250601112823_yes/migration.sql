/*
  Warnings:

  - You are about to drop the column `dataSourceId` on the `chart_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `dataSourceId` on the `table_blocks` table. All the data in the column will be lost.
  - You are about to drop the `api_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `data_sources` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileId` to the `chart_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xAxis` to the `chart_blocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yAxis` to the `chart_blocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_userId_fkey";

-- DropForeignKey
ALTER TABLE "chart_blocks" DROP CONSTRAINT "chart_blocks_dataSourceId_fkey";

-- DropForeignKey
ALTER TABLE "data_sources" DROP CONSTRAINT "data_sources_fileId_fkey";

-- DropForeignKey
ALTER TABLE "table_blocks" DROP CONSTRAINT "table_blocks_dataSourceId_fkey";

-- AlterTable
ALTER TABLE "chart_blocks" DROP COLUMN "dataSourceId",
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "xAxis" TEXT NOT NULL,
ADD COLUMN     "yAxis" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "table_blocks" DROP COLUMN "dataSourceId";

-- DropTable
DROP TABLE "api_keys";

-- DropTable
DROP TABLE "data_sources";

-- AddForeignKey
ALTER TABLE "chart_blocks" ADD CONSTRAINT "chart_blocks_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
