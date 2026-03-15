"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SummarizeButton({ boardId }: { boardId: string }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSummarize = async () => {
    if (!open) return; // Only run when opening

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/board/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId }),
      });

      const data = await res.json();

      if (res.ok) {
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary. Please try again.");
      }
    } catch (error) {
      setSummary("An error occurred while connecting to the AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && !summary) handleSummarize();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" className="border-2 border-gray-600">
          ✨ AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ✨ Board Summary
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of all the notes on this board.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-100 w-full rounded-md border p-4 bg-muted/30">
          {loading ? (
            <div className="flex h-full items-center justify-center flex-col gap-3 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              <p className="text-sm animate-pulse">
                AI is reading your notes...
              </p>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={handleSummarize}
            disabled={loading}
          >
            Regenerate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
