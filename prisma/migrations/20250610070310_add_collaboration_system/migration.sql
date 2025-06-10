-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'CONTRIBUTOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED');

-- CreateEnum
CREATE TYPE "RevisionType" AS ENUM ('DRAFT_SAVE', 'MAJOR_EDIT', 'REVIEW_NOTES');

-- CreateTable
CREATE TABLE "post_collaborators" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "status" "CollaborationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "post_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_revisions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revisionType" "RevisionType" NOT NULL,
    "summary" TEXT NOT NULL,
    "blocksChanged" INTEGER NOT NULL DEFAULT 0,
    "blocksAdded" INTEGER NOT NULL DEFAULT 0,
    "blocksRemoved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_collaborators_postId_userId_key" ON "post_collaborators"("postId", "userId");

-- AddForeignKey
ALTER TABLE "post_collaborators" ADD CONSTRAINT "post_collaborators_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_collaborators" ADD CONSTRAINT "post_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_collaborators" ADD CONSTRAINT "post_collaborators_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_revisions" ADD CONSTRAINT "post_revisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
