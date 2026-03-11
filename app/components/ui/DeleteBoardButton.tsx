"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteBoardButton({ boardId }: { boardId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const deleteBoard = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this board? All notes and edges will be permanently removed.",
      )
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
      className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-red-400 transition-all hover:border-red-500 hover:text-red-300 disabled:opacity-50 cursor-pointer"
      title="Delete board"
    >
      {deleting ? "..." : "Delete"}
    </button>
  );
}
