import { prisma } from "@/lib/prisma";
import Nodes from "./Nodes";
// import Editor from "./Editor";

interface PageProps {
  params: { id: string };
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    // <Editor noteId={note.id} initialContent={note.content} title={note.title} />
    <div className="p-4">
      <Nodes />
    </div>
  );
}
