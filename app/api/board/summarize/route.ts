import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { boardId } = await req.json();
    if (!boardId) {
      return NextResponse.json(
        { error: "boardId is required" },
        { status: 400 },
      );
    }

    const notes = await prisma.note.findMany({
      where: { boardId },
      select: { title: true, content: true },
    });

    if (notes.length === 0) {
      return NextResponse.json({
        summary: "This board has no notes to summarize yet.",
      });
    }

    //formant the notes into single string to pass inot genAI
    const textToSummarize = notes
      .map((n) => `Title: ${n.title}\nContent: ${n.content}`)
      .join("\n\n---\n\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful assistant. Please summarize the following notes from a digital whiteboard.
       Provide a concise, well-structured summary with key takeaways or action items if applicable.
       Format the output in clean text or markdown.\n\n${textToSummarize}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary." },
      { status: 500 },
    );
  }
}
