import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  // Get boards shared with this user
  const sharedWithMe = await prisma.boardShare.findMany({
    where: { sharedWithId: id },
    select: {
      boardOwnerId: true,
    },
  });

  // Get the owner details for shared boards
  const sharedOwnerIds = sharedWithMe.map((s) => s.boardOwnerId);
  const sharedOwners = await prisma.user.findMany({
    where: { id: { in: sharedOwnerIds } },
    select: { id: true, name: true, email: true },
  });

  // Count my notes
  const myNoteCount = await prisma.note.count({
    where: { authorId: id },
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
        {/* My Board */}
        <h2 className="mb-4 text-lg font-semibold text-neutral-300">
          My Board
        </h2>
        <Link
          href={`/note/${id}`}
          className="mb-10 flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all hover:border-purple-500/50 hover:bg-neutral-900"
        >
          <div>
            <p className="text-lg font-semibold">{user.name}&apos;s Board</p>
            <p className="mt-1 text-sm text-neutral-400">
              {myNoteCount} {myNoteCount === 1 ? "note" : "notes"}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        {/* Shared With Me */}
        <h2 className="mb-4 mt-10 text-lg font-semibold text-neutral-300">
          Shared with me
        </h2>
        {sharedOwners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
            <p className="text-neutral-500">
              No boards have been shared with you yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sharedOwners.map((owner) => (
              <Link
                key={owner.id}
                href={`/note/${owner.id}`}
                className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition-all hover:border-blue-500/50 hover:bg-neutral-900"
              >
                <div>
                  <p className="text-lg font-semibold">
                    {owner.name}&apos;s Board
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">{owner.email}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-500 text-sm font-bold">
                  {owner.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
