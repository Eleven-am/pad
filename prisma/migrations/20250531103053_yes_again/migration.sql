-- AlterTable
ALTER TABLE "heading_blocks" ADD COLUMN     "blockName" TEXT NOT NULL DEFAULT 'Heading';

-- AlterTable
ALTER TABLE "list_blocks" ADD COLUMN     "blockName" TEXT NOT NULL DEFAULT 'List';
