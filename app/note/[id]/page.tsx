import { prisma } from "@/lib/prisma";
import Nodes from "./Nodes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { id: boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      notes: true,
      noteEdges: true,
      boardShares: {
        include: {
          sharedWith: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-neutral-400">Board not found.</p>
      </div>
    );
  }

  const sharedUsers = board.boardShares.map((s) => s.sharedWith);

  return (
    <div className="h-screen w-screen">
      <Nodes
        notes={board.notes}
        noteEdges={board.noteEdges}
        boardId={board.id}
        boardOwnerId={board.ownerId}
        sharedUsers={sharedUsers}
      />
    </div>
  );
}
