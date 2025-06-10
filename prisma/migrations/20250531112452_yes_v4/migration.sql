/*
  Warnings:

  - You are about to drop the column `chartType` on the `chart_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `series` on the `chart_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `xAxis` on the `chart_blocks` table. All the data in the column will be lost.
  - You are about to drop the column `yAxis` on the `chart_blocks` table. All the data in the column will be lost.
  - Added the required column `chartType` to the `data_sources` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xAxis` to the `data_sources` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yAxis` to the `data_sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chart_blocks" DROP COLUMN "chartType",
DROP COLUMN "series",
DROP COLUMN "xAxis",
DROP COLUMN "yAxis";

-- AlterTable
ALTER TABLE "data_sources" ADD COLUMN     "chartType" "ChartType" NOT NULL,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "xAxis" TEXT NOT NULL,
ADD COLUMN     "yAxis" TEXT NOT NULL;
