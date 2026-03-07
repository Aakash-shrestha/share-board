"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface EditorProps {
  noteId: string;
  initialContent: string;
  title: string;
}

export default function Editor({ noteId, initialContent, title }: EditorProps) {
  const [content, setContent] = useState<string>(initialContent);
  const socket = getSocket();

  useEffect(() => {
    socket.emit("join-note", noteId);

    socket.on("update-note", (newContent: string) => {
      setContent(newContent);
    });

    return () => {
      socket.off("update-note");
    };
  }, [noteId, socket]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch("/api/save-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, content }),
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content, noteId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    socket.emit("edit-note", {
      noteId,
      content: value,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      <textarea
        value={content}
        onChange={handleChange}
        className="w-full h-[70vh] border p-4 rounded"
      />
    </div>
  );
}
