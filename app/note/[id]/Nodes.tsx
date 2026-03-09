"use client";
// Polyfill for Safari
if (typeof window !== "undefined" && !window.requestIdleCallback) {
  window.requestIdleCallback = ((cb: IdleRequestCallback) =>
    setTimeout(cb, 1)) as typeof window.requestIdleCallback;
  window.cancelIdleCallback = ((id: number) =>
    clearTimeout(id)) as typeof window.cancelIdleCallback;
}

import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TextUpdaterNode from "@/app/components/ui/TextUpdaterNode";
import { Note, NoteEdge } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

// These are defined OUTSIDE the component — no circular dependency
function notesToNodes(notes: Note[]): Node[] {
  return notes.map((note) => ({
    id: note.id,
    position: { x: note.positionX, y: note.positionY },
    data: {
      label: note.title,
      content: note.content,
      noteId: note.id,
    },
    type: "textUpdater",
  }));
}

function noteEdgesToEdges(noteEdges: NoteEdge[]): Edge[] {
  return noteEdges.map((edge) => ({
    id: `${edge.sourceId}-${edge.targetId}`,
    source: edge.sourceId,
    target: edge.targetId,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  }));
}

export default function Nodes({
  notes,
  noteEdges,
  authorId,
}: {
  notes: Note[];
  noteEdges: NoteEdge[];
  authorId: string;
}) {
  const [nodes, setNodes] = useState<Node[]>(notesToNodes(notes));
  const [edges, setEdges] = useState<Edge[]>(noteEdgesToEdges(noteEdges));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced save to database
  const saveLayout = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/save-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorId,
            nodes: currentNodes.map((n) => ({
              id: n.id,
              positionX: n.position.x,
              positionY: n.position.y,
            })),
            edges: currentEdges.map((e) => ({
              sourceId: e.source,
              targetId: e.target,
              sourceHandle: e.sourceHandle,
              targetHandle: e.targetHandle,
            })),
          }),
        });
      }, 500);
    },
    [authorId],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((prev) => {
        const updated = applyNodeChanges(changes, prev);
        setEdges((currentEdges) => {
          saveLayout(updated, currentEdges);
          return currentEdges;
        });
        return updated;
      }),
    [saveLayout],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((prev) => {
        const updated = applyEdgeChanges(changes, prev);
        setNodes((currentNodes) => {
          saveLayout(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      }),
    [saveLayout],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((prev) => {
        const updated = addEdge(params, prev);
        setNodes((currentNodes) => {
          saveLayout(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      }),
    [saveLayout],
  );

  const addNote = async () => {
    const positionX = Math.random() * 400;
    const positionY = Math.random() * 400;

    const res = await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Note",
        content: "",
        authorId,
        positionX,
        positionY,
      }),
    });

    const newNote: Note = await res.json();
    const newNode: Node = {
      id: newNote.id,
      position: { x: newNote.positionX, y: newNote.positionY },
      data: {
        label: newNote.title,
        content: newNote.content,
        noteId: newNote.id,
      },
      type: "textUpdater",
    };

    setNodes((prev) => [...prev, newNode]);
  };

  const router = useRouter();

  return (
    <div className="w-full h-full bg-sky-100">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button onClick={addNote}>+ Add Note</Button>
        <Button onClick={() => router.push("/")}>Logout</Button>
        <Avatar>
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="@shadcn"
            className="grayscale"
          />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </div>
      {nodes.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-neutral-400">
            No notes yet. Create your first one!
          </p>
          <button
            onClick={addNote}
            className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-blue-500 cursor-pointer"
          >
            + Create Note
          </button>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        />
      )}
    </div>
  );
}
