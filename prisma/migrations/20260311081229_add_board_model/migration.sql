/*
  Warnings:

  - You are about to drop the column `boardOwnerId` on the `BoardShare` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `NoteEdge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[boardId,sharedWithId]` on the table `BoardShare` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceId,targetId,sourceHandle,targetHandle,boardId]` on the table `NoteEdge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `boardId` to the `BoardShare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boardId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `boardId` to the `NoteEdge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_authorId_fkey";

-- DropIndex
DROP INDEX "BoardShare_boardOwnerId_sharedWithId_key";

-- DropIndex
DROP INDEX "NoteEdge_sourceId_targetId_sourceHandle_targetHandle_author_key";

-- AlterTable
ALTER TABLE "BoardShare" DROP COLUMN "boardOwnerId",
ADD COLUMN     "boardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "authorId",
ADD COLUMN     "boardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NoteEdge" DROP COLUMN "authorId",
ADD COLUMN     "boardId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Board',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardShare_boardId_sharedWithId_key" ON "BoardShare"("boardId", "sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteEdge_sourceId_targetId_sourceHandle_targetHandle_boardI_key" ON "NoteEdge"("sourceId", "targetId", "sourceHandle", "targetHandle", "boardId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteEdge" ADD CONSTRAINT "NoteEdge_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardShare" ADD CONSTRAINT "BoardShare_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
