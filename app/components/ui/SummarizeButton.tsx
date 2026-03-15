"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SummarizeButton({ boardId }: { boardId: string }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSummarize = async () => {
    // if (!open) return; // Only run when opening

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
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen && !summary) handleSummarize();
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="secondary" className="border-2 border-gray-600">
          ✨ AI Summary
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-2xl mx-auto h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            ✨ Board Summary
          </DrawerTitle>
          <DrawerDescription>
            AI-generated summary of all the notes on this board.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="flex-1 w-full rounded-md border p-4 bg-muted/30 mx-4 mt-2">
          {loading ? (
            <div className="flex h-full items-center justify-center flex-col gap-3 text-muted-foreground py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              <p className="text-sm animate-pulse">
                AI is reading your notes...
              </p>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap px-2">
              {summary}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end p-4 mb-4">
          <Button
            variant="outline"
            onClick={handleSummarize}
            disabled={loading}
          >
            Regenerate
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
