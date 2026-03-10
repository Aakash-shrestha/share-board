import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path/posix";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData.get("file") as File) || null;
    const noteId = (formData.get("noteId") as string) || null;

    if (!file || !noteId) {
      return NextResponse.json(
        { error: "NoteId and file are required" },
        { status: 400 },
      );
    }

    //validate the file types to only allow specific types of file
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/heic",
      "image/gif",
      "image/webp",
    ];
    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only jpeg, png, heic, gif and webp file formats are allowed to be uploaded",
        },
        { status: 400 },
      );
    }

    //create an upload directory inside the main file system if it does not already exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    //generate unique names ofr each fiels
    const ext = file.name.split(".").pop();
    const filename = `${noteId}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    //write the file to the disk
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const imageUrl = `/uploads/${filename}`;

    //upate the note with imageUrl
    const note = await prisma.note.update({
      where: { id: noteId },
      data: { imageUrl },
    });

    return NextResponse.json({ imageUrl: note.imageUrl });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const body: { noteId: string } = await req.json();
    const note = await prisma.note.update({
      where: { id: body.noteId },
      data: { imageUrl: null };
    }
    )
    return NextResponse.json(
      {success: true, note}
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to remove Image" },
      {status: 500}
    )
  }
}
