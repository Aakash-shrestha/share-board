import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path/posix";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "userId and file are required" },
        { status: 400 },
      );
    }

    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only jpeg, png, gif and webp formats are allowed" },
        { status: 400 },
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const filename = `${userId}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const profilePicture = `/uploads/avatars/${filename}`;

    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
    });

    return NextResponse.json({ profilePicture });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body: { userId: string } = await req.json();

    await prisma.user.update({
      where: { id: body.userId },
      data: { profilePicture: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 },
    );
  }
}
