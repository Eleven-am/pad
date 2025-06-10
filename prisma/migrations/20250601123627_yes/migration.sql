/*
  Warnings:

  - Made the column `showLabels` on table `chart_blocks` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "LabelPosition" AS ENUM ('INSIDE', 'OUTSIDE', 'CENTER');

-- CreateEnum
CREATE TYPE "Orientation" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- AlterTable
ALTER TABLE "chart_blocks" ADD COLUMN     "dotSize" INTEGER,
ADD COLUMN     "labelPosition" "LabelPosition",
ADD COLUMN     "orientation" "Orientation",
ADD COLUMN     "showDots" BOOLEAN,
ADD COLUMN     "startAngle" INTEGER,
ALTER COLUMN "showLabels" SET NOT NULL;
