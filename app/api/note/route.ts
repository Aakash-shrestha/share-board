import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body: {
    title: string;
    content: string;
    authorId: string;
    positionX?: number;
    positionY?: number;
  } = await req.json();

  const note = await prisma.note.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: body.authorId,
      positionX: body.positionX ?? 0,
      positionY: body.positionY ?? 0,
    },
  });

  return NextResponse.json(note);
}

export async function PATCH(req: Request) {
  const body: {
    noteId: string;
    title?: string;
    content?: string;
  } = await req.json();

  const note = await prisma.note.update({
    where: { id: body.noteId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
    },
  });

  return NextResponse.json(note);
}
