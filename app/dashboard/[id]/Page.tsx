import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateBoardMenu from "@/app/components/ui/CreateBoardButton";
import DeleteBoardButton from "@/app/components/ui/DeleteBoardButton";
import SharedBoardsList from "@/app/components/ui/SharedBoardsList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const myBoards = await prisma.board.findMany({
    where: { ownerId: id },
    include: {
      _count: { select: { notes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const sharedWithMe = await prisma.boardShare.findMany({
    where: { sharedWithId: id },
    include: {
      board: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { notes: true } },
        },
      },
    },
  });

  // Transform for the client component
  const sharedBoards = sharedWithMe.map((share) => ({
    id: share.board.id,
    name: share.board.name,
    ownerName: share.board.owner.name,
    noteCount: share.board._count.notes,
  }));

  return (
    <div className="relative min-h-screen bg-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]" />

      <header className="border-b border-border px-8 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
              S
            </div>
            <span className="text-sm font-semibold tracking-tight">
              ShareBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Link
              href="/"
              className="border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-10">
        {/* My Boards */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            My Boards
          </h2>
          <CreateBoardMenu ownerId={id} />
        </div>

        {myBoards.length === 0 ? (
          <div className="mb-10 border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No boards yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="mb-10 flex flex-col gap-2">
            {myBoards.map((board) => (
              <div
                key={board.id}
                className="group flex items-center justify-between border border-border bg-card px-5 py-4 transition-colors hover:bg-muted"
              >
                <Link href={`/note/${board.id}`} className="flex-1">
                  <p className="text-sm font-medium">{board.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {board._count.notes}{" "}
                    {board._count.notes === 1 ? "note" : "notes"}
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">
                    {board.name.charAt(0).toUpperCase()}
                  </div>
                  <DeleteBoardButton boardId={board.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Shared with me
        </h2>
        <SharedBoardsList userId={id} initialBoards={sharedBoards} />
      </main>
    </div>
  );
}
