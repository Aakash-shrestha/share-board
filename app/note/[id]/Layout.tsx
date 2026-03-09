import { prisma } from "@/lib/prisma";

export default async function NoteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500 text-sm font-bold">
            S
          </div>
          <span className="text-sm font-semibold tracking-tight">
            ShareBoard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            {user?.name ?? "Unknown User"}
          </span>
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
