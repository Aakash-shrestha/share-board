"use client";

import { useState, useCallback } from "react";
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
import { Note } from "@prisma/client";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

//map notes to nodes
function notesToNodes(notes: Note[]): Node[] {
  return notes.map((note, index) => ({
    id: note.id,
    position: { x: (index % 3) * 400, y: Math.floor(index / 3) * 250 },
    data: { label: note.title, content: note.content, noteId: note.id },
    type: "textUpdater",
  }));
}

export default function Nodes({
  notes,
  authorId,
}: {
  notes: Note[];
  authorId: string;
}) {
  const [nodes, setNodes] = useState<Node[]>(notesToNodes(notes));
  const [edges, setEdges] = useState<Edge[]>([]);

  // default function for node based ui and stuff
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  //make new nodes or notes same thing
  const addNote = async () => {
    const res = await fetch("/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Note",
        content: "",
        authorId,
      }),
    });

    const newNote: Note = await res.json();
    const newNode: Node = {
      id: newNote.id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "skyblue",
      }}
    >
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
