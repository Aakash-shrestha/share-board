"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBoardButton({ boardId }: { boardId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const deleteBoard = async () => {
    if (
      !confirm("Are you sure? All notes and edges will be permanently deleted.")
    ) {
      return;
    }

    setDeleting(true);
    try {
      await fetch("/api/board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId }),
      });

      router.refresh();
    } catch (err) {
      console.error("Failed to delete board:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={deleteBoard}
      disabled={deleting}
      className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
    >
      {deleting ? "..." : "Delete"}
    </button>
  );
}
