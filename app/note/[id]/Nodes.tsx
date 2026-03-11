"use client";
// Polyfill for Safari
if (typeof window !== "undefined" && !window.requestIdleCallback) {
  window.requestIdleCallback = ((cb: IdleRequestCallback) =>
    setTimeout(cb, 1)) as typeof window.requestIdleCallback;
  window.cancelIdleCallback = ((id: number) =>
    clearTimeout(id)) as typeof window.cancelIdleCallback;
}

import { useState, useCallback, useRef, useEffect } from "react";
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
  Background,
  BackgroundVariant,
  reconnectEdge,
  ConnectionMode,
} from "@xyflow/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import "@xyflow/react/dist/style.css";
import TextUpdaterNode from "@/app/components/ui/TextUpdaterNode";
import ShareDialog from "@/app/components/ui/ShareDialog";
import { Note, NoteEdge } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSocket } from "@/lib/socket";

const nodeTypes = {
  textUpdater: TextUpdaterNode,
};

function notesToNodes(notes: Note[], boardId: string): Node[] {
  return notes.map((note) => ({
    id: note.id,
    position: { x: note.positionX, y: note.positionY },
    data: {
      label: note.title,
      content: note.content,
      imageUrl: note.imageUrl || null,
      noteId: note.id,
      boardId,
    },
    type: "textUpdater",
  }));
}

function noteEdgesToEdges(noteEdges: NoteEdge[]): Edge[] {
  return noteEdges.map((edge) => ({
    id: `${edge.sourceId}-${edge.sourceHandle ?? "default"}-${edge.targetId}-${edge.targetHandle ?? "default"}`,
    source: edge.sourceId,
    target: edge.targetId,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  }));
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
}

export default function Nodes({
  notes,
  noteEdges,
  boardId,
  boardName,
  boardOwnerId,
  boardOwnerName,
  noteCount,
  currentUserId,
  sharedUsers,
}: {
  notes: Note[];
  noteEdges: NoteEdge[];
  boardId: string;
  boardName: string;
  boardOwnerId: string;
  boardOwnerName: string;
  noteCount: number;
  currentUserId: string;
  sharedUsers: SharedUser[];
}) {
  const [nodes, setNodes] = useState<Node[]>(notesToNodes(notes, boardId));
  const [edges, setEdges] = useState<Edge[]>(noteEdgesToEdges(noteEdges));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdate = useRef(false);
  const router = useRouter();
  const socket = getSocket();

  // Join the board room for live collaboration
  useEffect(() => {
    socket.emit("join-board", boardId);

    socket.on(
      "node-moved",
      (data: { nodeId: string; positionX: number; positionY: number }) => {
        isRemoteUpdate.current = true;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === data.nodeId
              ? { ...n, position: { x: data.positionX, y: data.positionY } }
              : n,
          ),
        );
      },
    );

    socket.on("node-added", (data: { node: Node }) => {
      isRemoteUpdate.current = true;
      setNodes((prev) => {
        if (prev.some((n) => n.id === data.node.id)) return prev;
        return [...prev, data.node];
      });
    });

    socket.on(
      "node-edited",
      (data: { noteId: string; title: string; content: string }) => {
        isRemoteUpdate.current = true;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === data.noteId
              ? {
                  ...n,
                  data: { ...n.data, label: data.title, content: data.content },
                }
              : n,
          ),
        );
      },
    );

    socket.on("node-deleted", (data: { noteId: string }) => {
      isRemoteUpdate.current = true;
      setNodes((prev) => prev.filter((n) => n.id !== data.noteId));
      setEdges((prev) =>
        prev.filter(
          (e) => e.source !== data.noteId && e.target !== data.noteId,
        ),
      );
    });

    socket.on("edge-added", (data: { edge: Edge }) => {
      isRemoteUpdate.current = true;
      setEdges((prev) => {
        if (prev.some((e) => e.id === data.edge.id)) return prev;
        return [...prev, data.edge];
      });
    });

    socket.on("edge-removed", (data: { edgeId: string }) => {
      isRemoteUpdate.current = true;
      setEdges((prev) => prev.filter((e) => e.id !== data.edgeId));
    });

    socket.on(
      "node-image-updated",
      (data: { noteId: string; imageUrl: string }) => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === data.noteId
              ? { ...n, data: { ...n.data, imageUrl: data.imageUrl } }
              : n,
          ),
        );
      },
    );

    socket.on("node-image-removed", (data: { noteId: string }) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === data.noteId
            ? { ...n, data: { ...n.data, imageUrl: null } }
            : n,
        ),
      );
    });

    return () => {
      socket.emit("leave-board", boardId);
      socket.off("node-moved");
      socket.off("node-added");
      socket.off("node-edited");
      socket.off("node-deleted");
      socket.off("edge-added");
      socket.off("edge-removed");
      socket.off("node-image-updated");
      socket.off("node-image-removed");
    };
  }, [boardId, socket]);

  // Debounced save to database
  const saveLayout = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/save-layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boardId,
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
    [boardId],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((prev) => {
        const updated = applyNodeChanges(changes, prev);

        if (!isRemoteUpdate.current) {
          for (const change of changes) {
            if (change.type === "position" && change.position) {
              socket.emit("node-moved", {
                boardId,
                nodeId: change.id,
                positionX: change.position.x,
                positionY: change.position.y,
              });
            }

            if (change.type === "remove") {
              fetch("/api/note", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: change.id }),
              });

              socket.emit("node-deleted", {
                boardId,
                noteId: change.id,
              });

              setEdges((prevEdges) =>
                prevEdges.filter(
                  (e) => e.source !== change.id && e.target !== change.id,
                ),
              );
            }
          }
        }
        isRemoteUpdate.current = false;

        setEdges((currentEdges) => {
          saveLayout(updated, currentEdges);
          return currentEdges;
        });
        return updated;
      }),
    [saveLayout, boardId, socket],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((prev) => {
        const updated = applyEdgeChanges(changes, prev);

        if (!isRemoteUpdate.current) {
          for (const change of changes) {
            if (change.type === "remove") {
              socket.emit("edge-removed", {
                boardId,
                edgeId: change.id,
              });
            }
          }
        }
        isRemoteUpdate.current = false;

        setNodes((currentNodes) => {
          saveLayout(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      }),
    [saveLayout, boardId, socket],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((prev) => {
        const updated = addEdge(params, prev);
        const newEdge = updated[updated.length - 1];

        socket.emit("edge-added", {
          boardId,
          edge: newEdge,
        });

        setNodes((currentNodes) => {
          saveLayout(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      }),
    [saveLayout, boardId, socket],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((prev) => {
        const updated = reconnectEdge(oldEdge, newConnection, prev);

        if (!isRemoteUpdate.current) {
          socket.emit("edge-removed", {
            boardId,
            edgeId: oldEdge.id,
          });

          const newEdge =
            updated.find(
              (e) => e.id !== oldEdge.id && !prev.some((p) => p.id === e.id),
            ) || updated[updated.length - 1];
          socket.emit("edge-added", {
            boardId,
            edge: newEdge,
          });
        }

        setNodes((currentNodes) => {
          saveLayout(currentNodes, updated);
          return currentNodes;
        });
        return updated;
      }),
    [saveLayout, boardId, socket],
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
        boardId,
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
        imageUrl: null,
        noteId: newNote.id,
        boardId,
      },
      type: "textUpdater",
    };

    setNodes((prev) => [...prev, newNode]);

    socket.emit("node-added", {
      boardId,
      node: newNode,
    });
  };

  return (
    <div className="w-full h-full bg-white">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button onClick={addNote}>+ Add Note</Button>
        <ShareDialog
          boardId={boardId}
          boardOwnerId={boardOwnerId}
          boardName={boardName}
          ownerName={boardOwnerName}
          noteCount={noteCount}
          initialSharedUsers={sharedUsers}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/${currentUserId}`)}
            >
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => router.push("/")}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {nodes.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]">
          <p className="text-neutral-400">
            No notes yet. Create your first one!
          </p>
          <Button onClick={addNote}>+ Create Note</Button>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          fitView
          proOptions={{ hideAttribution: true }}
          connectionMode={ConnectionMode.Loose}
          edgesReconnectable
          defaultEdgeOptions={{
            selectable: true,
            deletable: true,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="#798596"
          />
        </ReactFlow>
      )}
    </div>
  );
}
