import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateBoardMenu from "@/app/components/ui/CreateBoardButton";
import DeleteBoardButton from "@/app/components/ui/DeleteBoardButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">User not found.</p>
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

  return (
    <div className="relative min-h-screen">
      {/* Dot grid background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[20px_20px]" />

      <header className="border-b border-neutral-800/60 px-8 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center border border-neutral-700 text-xs font-bold text-red-500">
              S
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              ShareBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">{user.email}</span>
            <Link
              href="/"
              className="border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-10">
        {/* My Boards */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            My Boards
          </h2>
          <CreateBoardMenu ownerId={id} />
        </div>

        {myBoards.length === 0 ? (
          <div className="mb-10 border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-sm text-neutral-600">
              No boards yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="mb-10 flex flex-col gap-2">
            {myBoards.map((board) => (
              <div
                key={board.id}
                className="group flex items-center justify-between border border-neutral-800/60 bg-neutral-900/40 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80"
              >
                <Link href={`/note/${board.id}`} className="flex-1">
                  <p className="text-sm font-medium text-white">{board.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {board._count.notes}{" "}
                    {board._count.notes === 1 ? "note" : "notes"}
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center border border-neutral-700 text-[10px] font-bold text-red-500">
                    {board.name.charAt(0).toUpperCase()}
                  </div>
                  <DeleteBoardButton boardId={board.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared With Me */}
        <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-neutral-500">
          Shared with me
        </h2>
        {sharedWithMe.length === 0 ? (
          <div className="border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-sm text-neutral-600">
              No boards have been shared with you yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sharedWithMe.map((share) => (
              <Link
                key={share.id}
                href={`/note/${share.board.id}`}
                className="flex items-center justify-between border border-neutral-800/60 bg-neutral-900/40 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900/80"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {share.board.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    by {share.board.owner.name} &middot;{" "}
                    {share.board._count.notes}{" "}
                    {share.board._count.notes === 1 ? "note" : "notes"}
                  </p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center border border-neutral-700 text-[10px] font-bold text-neutral-400">
                  {share.board.owner.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
