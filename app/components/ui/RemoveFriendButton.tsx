"use client";
import { useState } from "react";

export default function RemoveFriendButton({
  userId,
  friendId,
}: {
  userId: string;
  friendId: string;
}) {
  const [deleting, setDeleting] = useState<boolean>(false);
  const handleDelete = async () => {};
  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
    >
      Remove Friend
    </button>
  );
}
