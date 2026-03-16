import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const body: { userId: string; friendId: string } = await req.json();
    if (!body.userId || !body.friendId) {
      return NextResponse.json(
        { error: "userId and friendId are required" },
        { status: 400 },
      );
    }

    await prisma.boardShare.deleteMany({
      where: {
        OR: [
          { board: { ownerId: body.userId }, sharedWithId: body.friendId },
          { board: { ownerId: body.friendId }, sharedWithId: body.userId },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove friend shares:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
