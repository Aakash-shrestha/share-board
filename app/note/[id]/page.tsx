import { prisma } from "@/lib/prisma";
import Nodes from "./Nodes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;

  const [notes, noteEdges] = await Promise.all([
    prisma.note.findMany({ where: { authorId: id } }),
    prisma.noteEdge.findMany({ where: { authorId: id } }),
  ]);

  if (!notes.length) {
    return <div className="p-4">No notes found for this user.</div>;
  }

  return (
    <div className="p-4">
      <Nodes notes={notes} noteEdges={noteEdges} authorId={id} />
    </div>
  );
}
