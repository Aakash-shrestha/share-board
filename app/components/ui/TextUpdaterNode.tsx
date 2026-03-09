import { Handle, Position } from "@xyflow/react";
import { useState, useCallback } from "react";

interface TextUpdaterNodeData {
  label: string;
  content: string;
  noteId: string;
  onNodeUpdate?: (noteId: string, title: string, content: string) => void;
}

export default function TextUpdaterNode({
  data,
}: {
  data: TextUpdaterNodeData;
}) {
  const [title, setTitle] = useState(data.label);
  const [content, setContent] = useState(data.content);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/note", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: data.noteId,
          title,
          content,
        }),
      });
      // Update the node data in the parent
      data.onNodeUpdate?.(data.noteId, title, content);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  }, [data, title, content]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        save();
      }
    },
    [save],
  );

  return (
    <div className="text-updater-node">
      <div className="flex flex-col gap-2 bg-white text-black rounded-lg p-4 border border-gray-300 shadow-md min-w-50 max-w-75">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="nodrag font-bold text-lg border-b border-gray-200 pb-1 outline-none bg-transparent focus:border-blue-400"
          placeholder="Title..."
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="nodrag text-sm text-gray-700 outline-none bg-transparent resize-none focus:border-blue-400 border border-transparent rounded p-1"
          placeholder="Write something..."
        />
        <span className="text-xs text-gray-400">
          {saving ? "Saving..." : "Press Enter to save"}
        </span>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Right} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    </div>
  );
}
