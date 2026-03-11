import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateBoardButton from "@/app/components/ui/CreateBoardButton";
import DeleteBoardButton from "@/app/components/ui/DeleteBoardButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  // Get all boards owned by this user with note counts
  const myBoards = await prisma.board.findMany({
    where: { ownerId: id },
    include: {
      _count: { select: { notes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Get boards shared with this user
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 bg-neutral-900/80 px-8 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500 text-sm font-bold">
              S
            </div>
            <span className="font-semibold tracking-tight">ShareBoard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">
              Welcome, {user.name}
            </span>
            <Link
              href="/"
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-all hover:border-neutral-500 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 py-10">
        {/* My Boards */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-300">My Boards</h2>
          <CreateBoardButton ownerId={id} />
        </div>

        {myBoards.length === 0 ? (
          <div className="mb-10 rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-neutral-500">
              You don&apos;t have any boards yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="mb-10 flex flex-col gap-3">
            {myBoards.map((board) => (
              <div
                key={board.id}
                className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all hover:border-purple-500/50 hover:bg-neutral-900"
              >
                <Link href={`/note/${board.id}`} className="flex-1">
                  <p className="text-lg font-semibold">{board.name}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {board._count.notes}{" "}
                    {board._count.notes === 1 ? "note" : "notes"}
                  </p>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-sm font-bold">
                    {board.name.charAt(0).toUpperCase()}
                  </div>
                  <DeleteBoardButton boardId={board.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared With Me */}
        <h2 className="mb-4 text-lg font-semibold text-neutral-300">
          Shared with me
        </h2>
        {sharedWithMe.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-neutral-500">
              No boards have been shared with you yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sharedWithMe.map((share) => (
              <Link
                key={share.id}
                href={`/note/${share.board.id}`}
                className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all hover:border-blue-500/50 hover:bg-neutral-900"
              >
                <div>
                  <p className="text-lg font-semibold">{share.board.name}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    by {share.board.owner.name} &middot;{" "}
                    {share.board._count.notes}{" "}
                    {share.board._count.notes === 1 ? "note" : "notes"}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-sm font-bold">
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
