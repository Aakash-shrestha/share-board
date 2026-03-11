import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body: {
    boardId: string;
    nodes: { id: string; positionX: number; positionY: number }[];
    edges: {
      sourceId: string;
      targetId: string;
      sourceHandle?: string;
      targetHandle?: string;
    }[];
  } = await req.json();

  const nodeUpdates = body.nodes.map((node) =>
    prisma.note.update({
      where: { id: node.id },
      data: {
        positionX: node.positionX,
        positionY: node.positionY,
      },
    }),
  );

  const deleteEdges = prisma.noteEdge.deleteMany({
    where: { boardId: body.boardId },
  });

  const createEdges = prisma.noteEdge.createMany({
    data: body.edges.map((edge) => ({
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      boardId: body.boardId,
    })),
  });

  await prisma.$transaction([...nodeUpdates, deleteEdges, createEdges]);

  return NextResponse.json({ success: true });
}
