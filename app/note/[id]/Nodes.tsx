"use client";

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

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

// Map notes to nodes using saved positions
function notesToNodes(notes: Note[]): Node[] {
  return notes.map((note) => ({
    id: note.id,
    position: { x: note.positionX, y: note.positionY },
    data: { label: note.title, content: note.content, noteId: note.id },
    type: "textUpdater",
  }));
}

// Map NoteEdges to React Flow edges
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

  return (
    <div style={{ width: "100vw", height: "100vh", background: "skyblue" }}>
      <button
        onClick={addNote}
        className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md cursor-pointer"
      >
        + Add Note
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
