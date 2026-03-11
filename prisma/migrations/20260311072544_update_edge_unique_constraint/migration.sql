/*
  Warnings:

  - A unique constraint covering the columns `[sourceId,targetId,sourceHandle,targetHandle,authorId]` on the table `NoteEdge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "NoteEdge_sourceId_targetId_authorId_key";

-- CreateIndex
CREATE UNIQUE INDEX "NoteEdge_sourceId_targetId_sourceHandle_targetHandle_author_key" ON "NoteEdge"("sourceId", "targetId", "sourceHandle", "targetHandle", "authorId");
