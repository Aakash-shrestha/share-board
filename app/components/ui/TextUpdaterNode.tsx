import { Handle, Position } from "@xyflow/react";

export default function TextUpdaterNode({
  data,
}: {
  data: { label: string; content: string; noteId: string };
}) {
  return (
    <div className="text-updater-node">
      <div className="flex flex-col gap-2 bg-white text-black rounded-lg p-4 border border-gray-300 shadow-md">
        <h3 className="font-bold text-lg border-b border-gray-200 pb-1">
          {data.label}
        </h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {data.content || "Empty note..."}
        </p>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Right} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    </div>
  );
}
