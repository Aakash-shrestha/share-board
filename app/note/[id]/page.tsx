import { prisma } from "@/lib/prisma";
import Nodes from "./Nodes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;

  // Check if this is a board owner or a shared user viewing someone's board
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  // The board owner is always the id in the URL
  const boardOwnerId = id;

  const [notes, noteEdges, shares] = await Promise.all([
    prisma.note.findMany({ where: { authorId: boardOwnerId } }),
    prisma.noteEdge.findMany({ where: { authorId: boardOwnerId } }),
    prisma.boardShare.findMany({
      where: { boardOwnerId },
      include: {
        sharedWith: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const sharedUsers = shares.map((s) => s.sharedWith);

  return (
    <div className="h-screen w-screen bg-sky-100">
      <Nodes
        notes={notes}
        noteEdges={noteEdges}
        authorId={boardOwnerId}
        sharedUsers={sharedUsers}
      />
    </div>
  );
}
