"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface SharedUser {
  id: string;
  name: string;
  email: string;
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

export default function ShareDialog({
  boardOwnerId,
  initialSharedUsers,
}: {
  boardOwnerId: string;
  initialSharedUsers: SharedUser[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sharedUsers, setSharedUsers] =
    useState<SharedUser[]>(initialSharedUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.length < 2) {
        setResults([]);
        return;
      }
      const res = await fetch(
        `/api/share?q=${encodeURIComponent(q)}&excludeId=${boardOwnerId}`,
      );
      const data = await res.json();
      setResults(data);
    },
    [boardOwnerId],
  );

  const shareWith = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardOwnerId, sharedWithEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      const user = results.find((r) => r.email === email);
      if (user) {
        setSharedUsers((prev) => [...prev, user]);
      }
      setQuery("");
      setResults([]);
    } catch {
      setError("Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const removeShare = async (userId: string) => {
    await fetch("/api/share", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardOwnerId,
        sharedWithId: userId,
      }),
    });
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Share</Button>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Share Board
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => searchUsers(e.target.value)}
          placeholder="Search by email..."
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
        />

        {/* Search results */}
        {results.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-neutral-200 bg-white">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => shareWith(user.email)}
                disabled={loading || sharedUsers.some((s) => s.id === user.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-neutral-50 disabled:opacity-50 cursor-pointer border-b border-neutral-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-neutral-900">{user.name}</p>
                  <p className="text-neutral-500">{user.email}</p>
                </div>
                {sharedUsers.some((s) => s.id === user.id) ? (
                  <span className="text-xs text-green-600">Shared</span>
                ) : (
                  <span className="text-xs text-blue-600">+ Add</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {/* Shared users list */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Shared with
          </p>
          {sharedUsers.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Not shared with anyone yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {sharedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => removeShare(user.id)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
