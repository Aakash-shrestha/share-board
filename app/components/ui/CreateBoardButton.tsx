"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CreateBoardMenu({ ownerId }: { ownerId: string }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createBoard = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId, name: name.trim() }),
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-red-600 text-white hover:bg-red-500">
          + New Board
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Create Board
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-2 pt-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
                createBoard();
              }
            }}
            placeholder="Board name..."
            className="border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-red-500"
            autoFocus
          />
          <Button
            onClick={createBoard}
            disabled={creating || !name.trim()}
            className="w-full bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
