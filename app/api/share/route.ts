import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const excludeId = searchParams.get("excludeId") || "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const users = await prisma.user.findMany({
    where: {
      email: { contains: query, mode: "insensitive" },
      id: { not: excludeId },
    },
    select: { id: true, name: true, email: true },
    take: 5,
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const body: { boardId: string; sharedWithEmail: string } = await req.json();

    const board = await prisma.board.findUnique({
      where: { id: body.boardId },
    });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: body.sharedWithEmail },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.id === board.ownerId) {
      return NextResponse.json(
        { error: "Cannot share with yourself" },
        { status: 400 },
      );
    }

    const existing = await prisma.boardShare.findUnique({
      where: {
        boardId_sharedWithId: {
          boardId: body.boardId,
          sharedWithId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already shared with this user" },
        { status: 409 },
      );
    }

    const share = await prisma.boardShare.create({
      data: {
        boardId: body.boardId,
        sharedWithId: user.id,
      },
    });

    return NextResponse.json(share);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const body: { boardId: string; sharedWithId: string } = await req.json();

  await prisma.boardShare.delete({
    where: {
      boardId_sharedWithId: {
        boardId: body.boardId,
        sharedWithId: body.sharedWithId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
