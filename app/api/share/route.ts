import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Search users by email (for the share dialog)
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

// Share a board with a user
export async function POST(req: Request) {
  try {
    const body: { boardOwnerId: string; sharedWithEmail: string } =
      await req.json();

    const user = await prisma.user.findUnique({
      where: { email: body.sharedWithEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.id === body.boardOwnerId) {
      return NextResponse.json(
        { error: "Cannot share with yourself" },
        { status: 400 },
      );
    }

    const existing = await prisma.boardShare.findUnique({
      where: {
        boardOwnerId_sharedWithId: {
          boardOwnerId: body.boardOwnerId,
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
        boardOwnerId: body.boardOwnerId,
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

// Remove a share
export async function DELETE(req: Request) {
  const body: { boardOwnerId: string; sharedWithId: string } = await req.json();

  await prisma.boardShare.delete({
    where: {
      boardOwnerId_sharedWithId: {
        boardOwnerId: body.boardOwnerId,
        sharedWithId: body.sharedWithId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
