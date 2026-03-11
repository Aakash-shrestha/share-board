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
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
            S
          </div>
          <span className="text-sm font-semibold tracking-tight">
            ShareBoard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.name ?? "Unknown User"}
          </span>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
