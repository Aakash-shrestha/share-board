"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBoardButton({ ownerId }: { ownerId: string }) {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createBoard = async () => {
    setCreating(true);
    try {
      const name = prompt("Board name:", "Untitled Board");
      if (!name) {
        setCreating(false);
        return;
      }

      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, name }),
      });

      const board = await res.json();
      router.push(`/note/${board.id}`);
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <button
      onClick={createBoard}
      disabled={creating}
      className="rounded-lg bg-linear-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 cursor-pointer"
    >
      {creating ? "Creating..." : "+ New Board"}
    </button>
  );
}
