import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body: {
    noteId: string;
    content: string;
  } = await req.json();

  await prisma.note.update({
    where: { id: body.noteId },
    data: { content: body.content },
  });

  return NextResponse.json({ success: true });
}
