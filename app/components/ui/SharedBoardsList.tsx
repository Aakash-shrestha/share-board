"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket";

interface SharedBoard {
  id: string;
  name: string;
  ownerName: string;
  noteCount: number;
}

export default function SharedBoardsList({
  userId,
  initialBoards,
}: {
  userId: string;
  initialBoards: SharedBoard[];
}) {
  const [boards, setBoards] = useState<SharedBoard[]>(initialBoards);

  useEffect(() => {
    const socket = getSocket();

    const joinAndListen = () => {
      console.log(
        "[SharedBoardsList] Socket connected, joining user room:",
        userId,
      );
      socket.emit("join-user", userId);
    };

    // If already connected, join immediately. Otherwise wait.
    if (socket.connected) {
      joinAndListen();
    } else {
      socket.on("connect", joinAndListen);
    }

    socket.on(
      "board-shared",
      (data: {
        userId: string;
        board: {
          id: string;
          name: string;
          ownerName: string;
          noteCount: number;
        };
      }) => {
        console.log("[SharedBoardsList] Received board-shared:", data);
        setBoards((prev) => {
          if (prev.some((b) => b.id === data.board.id)) return prev;
          return [...prev, data.board];
        });
      },
    );

    socket.on("board-unshared", (data: { userId: string; boardId: string }) => {
      console.log("[SharedBoardsList] Received board-unshared:", data);
      setBoards((prev) => prev.filter((b) => b.id !== data.boardId));
    });

    return () => {
      socket.off("connect", joinAndListen);
      socket.off("board-shared");
      socket.off("board-unshared");
      socket.emit("leave-user", userId);
    };
  }, [userId]);

  if (boards.length === 0) {
    return (
      <div className="border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No boards have been shared with you yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {boards.map((board) => (
        <Link
          key={board.id}
          href={`/note/${board.id}`}
          className="flex items-center justify-between border border-border bg-card px-5 py-4 transition-colors hover:bg-muted"
        >
          <div>
            <p className="text-sm font-medium">{board.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              by {board.ownerName} &middot; {board.noteCount}{" "}
              {board.noteCount === 1 ? "note" : "notes"}
            </p>
          </div>
          <div className="flex h-7 w-7 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">
            {board.ownerName.charAt(0).toUpperCase()}
          </div>
        </Link>
      ))}
    </div>
  );
}
