import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// create new board
export async function POST(req: Request) {
  const body: { ownerId: string; name?: string } = await req.json();

  const board = await prisma.board.create({
    data: {
      name: body.name || "Untitled Board",
      ownerId: body.ownerId,
    },
  });

  return NextResponse.json(board);
}

// rename a board
export async function PATCH(req: Request) {
  const body: { boardId: string; name: string } = await req.json();

  const board = await prisma.board.update({
    where: { id: body.boardId },
    data: { name: body.name },
  });

  return NextResponse.json(board);
}

//delete a board, it should also delete notes edges and shares associated with it
export async function DELETE(req: Request) {
  const body: { boardId: string } = await req.json();

  const board = await prisma.board.delete({
    where: { id: body.boardId },
  });

  return NextResponse.json(board);
}
