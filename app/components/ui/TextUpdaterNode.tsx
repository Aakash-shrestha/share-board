import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import Image from "next/image";

interface TextUpdaterNodeData {
  label: string;
  content: string;
  noteId: string;
  boardId: string;
  imageUrl: string | null;
}

export default function TextUpdaterNode({
  id,
  data,
}: {
  id: string;
  data: TextUpdaterNodeData;
}) {
  const [title, setTitle] = useState(data.label);
  const [content, setContent] = useState(data.content);
  const [imageUrl, setImageUrl] = useState<string | null>(data.imageUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = getSocket();
  const { deleteElements } = useReactFlow();

  const handleDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  // Sync local state when remote updates come in
  useEffect(() => {
    setTitle(data.label);
  }, [data.label]);

  useEffect(() => {
    setContent(data.content);
  }, [data.content]);

  useEffect(() => {
    setImageUrl(data.imageUrl);
  }, [data.imageUrl]);

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

      socket.emit("node-edited", {
        boardId: data.boardId,
        noteId: data.noteId,
        title,
        content,
      });
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  }, [data.noteId, data.boardId, title, content, socket]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        save();
      }
    },
    [save],
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("noteId", data.noteId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (res.ok) {
          setImageUrl(result.imageUrl);

          socket.emit("node-image-updated", {
            boardId: data.boardId,
            noteId: data.noteId,
            imageUrl: result.imageUrl,
          });
        }
      } catch (err) {
        console.error("Failed to upload image:", err);
      } finally {
        setUploading(false);
        // Reset input so same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [data.noteId, data.boardId, socket],
  );

  const removeImage = useCallback(async () => {
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: data.noteId }),
      });

      setImageUrl(null);

      socket.emit("node-image-removed", {
        boardId: data.boardId,
        noteId: data.noteId,
      });
    } catch (err) {
      console.error("Failed to remove image:", err);
    }
  }, [data.noteId, data.boardId, socket]);

  return (
    <div className="text-updater-node">
      <div className="relative flex flex-col gap-2 bg-white text-black rounded-xl p-4 border border-gray-200 shadow-lg min-w-55 max-w-75 group">
        <button
          onClick={handleDelete}
          className="nodrag absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer shadow-md"
          title="Delete note"
        >
          ✕
        </button>

        {/* Image */}
        {imageUrl && (
          <div className="relative -mx-4 -mt-4 mb-1">
            <Image
              src={imageUrl}
              alt="Note"
              className="w-full h-40 object-cover rounded-t-xl"
              width={300}
              height={160}
            />
            <button
              onClick={removeImage}
              className="nodrag absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-red-600 transition-colors cursor-pointer"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="nodrag font-bold text-base border-b border-gray-200 pb-1 outline-none bg-transparent focus:border-blue-400"
          placeholder="Title..."
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="nodrag text-sm text-gray-600 outline-none bg-transparent resize-none focus:border-blue-400 border border-transparent rounded p-1"
          placeholder="Write something..."
        />

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="nodrag flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-400 transition-all hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              {imageUrl ? "Replace image" : "Add image"}
            </>
          )}
        </button>

        {/* Status */}
        <span className="text-[10px] text-gray-400 text-center">
          {saving ? "Saving..." : "Press Enter to save"}
        </span>

        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Right} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    </div>
  );
}
