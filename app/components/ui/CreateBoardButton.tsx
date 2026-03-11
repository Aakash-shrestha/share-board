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
        <Button>+ New Board</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
            className="border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
            autoFocus
          />
          <Button
            onClick={createBoard}
            disabled={creating || !name.trim()}
            className="w-full"
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
