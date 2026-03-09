-- CreateTable
CREATE TABLE "BoardShare" (
    "id" TEXT NOT NULL,
    "boardOwnerId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardShare_boardOwnerId_sharedWithId_key" ON "BoardShare"("boardOwnerId", "sharedWithId");

-- AddForeignKey
ALTER TABLE "BoardShare" ADD CONSTRAINT "BoardShare_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
