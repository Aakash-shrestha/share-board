import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { match } from "node:assert";

export async function PATCH(req: Request) {
  try {
    const body: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    } = await req.json();

    if (!body.userId || !body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const matchCurrentPassword = await bcrypt.compare(
      user.password,
      body.currentPassword,
    );
    if (!matchCurrentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    const newHashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.update({
      where: { id: body.userId },
      data: { password: newHashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
