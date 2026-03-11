"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  boardId,
  boardOwnerId,
  initialSharedUsers,
}: {
  boardId: string;
  boardOwnerId: string;
  initialSharedUsers: SharedUser[];
}) {
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
        body: JSON.stringify({ boardId, sharedWithEmail: email }),
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
        boardId,
        sharedWithId: userId,
      }),
    });
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Share</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <DropdownMenuLabel className="text-base font-semibold text-neutral-900">
          Share Board
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-1 py-2">
          <input
            type="text"
            value={query}
            onChange={(e) => searchUsers(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search by email..."
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {results.length > 0 && (
          <div className="max-h-40 overflow-y-auto">
            {results.map((user) => {
              const alreadyShared = sharedUsers.some((s) => s.id === user.id);
              return (
                <DropdownMenuItem
                  key={user.id}
                  disabled={loading || alreadyShared}
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!alreadyShared) shareWith(user.email);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{user.name}</p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  {alreadyShared ? (
                    <span className="text-xs text-green-600">Shared</span>
                  ) : (
                    <span className="text-xs text-blue-600">+ Add</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        {error && <p className="px-1 py-1 text-sm text-foreground">{error}</p>}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          Shared with
        </DropdownMenuLabel>

        {sharedUsers.length === 0 ? (
          <p className="px-2 py-2 text-sm text-neutral-400">
            Not shared with anyone yet
          </p>
        ) : (
          <div className="flex flex-col gap-1 py-1">
            {sharedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
                <button
                  onClick={() => removeShare(user.id)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
