import { MemoriesClient } from "@/components/MemoriesClient";

export default function MemoriesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Memories</h1>
      <p className="text-zinc-600">
        Photos from the event. Anyone signed in can add a memory.
      </p>
      <MemoriesClient />
    </div>
  );
}
