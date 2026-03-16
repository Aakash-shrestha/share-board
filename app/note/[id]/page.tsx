import { prisma } from "@/lib/prisma";
import Nodes from "./Nodes";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { id: boardId } = await params;

  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("userId")?.value;

  if (!currentUserId) {
    redirect("/");
  }

  //find the detail about current user using the currentUserId
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { profilePicture: true },
  });

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true } },
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
        boardName={board.name}
        boardOwnerId={board.ownerId}
        boardOwnerName={board.owner.name}
        noteCount={board.notes.length}
        currentUserId={currentUserId}
        sharedUsers={sharedUsers}
        currentUserProfilePicture={currentUser?.profilePicture || null}
      />
    </div>
  );
}
