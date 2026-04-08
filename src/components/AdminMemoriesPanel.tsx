"use client";

import { useCallback, useState } from "react";

type PhotoUser = {
  name: string | null;
  slackId: string | null;
  email: string | null;
};

export type AdminPhoto = {
  id: string;
  publicPath: string;
  caption: string | null;
  createdAt: string;
  user: PhotoUser;
};

export function AdminMemoriesPanel({ initialPhotos }: { initialPhotos: AdminPhoto[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);

  const remove = useCallback(async (id: string) => {
    if (!confirm("Remove this photo?")) return;
    const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not remove photo.");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/memories", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      alert("Upload failed.");
      return;
    }
    const data = (await res.json()) as { photo: AdminPhoto };
    setPhotos((prev) => [data.photo, ...prev]);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-zinc-200 p-4">
        <h3 className="mb-2 text-base font-medium">Add photo (admin)</h3>
        <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-2">
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
            className="text-sm"
          />
          <input
            type="text"
            name="caption"
            placeholder="Caption (optional)"
            className="rounded border border-zinc-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={uploading}
            className="w-fit rounded bg-zinc-800 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2 pr-4 font-medium">Preview</th>
              <th className="py-2 pr-4 font-medium">Caption</th>
              <th className="py-2 pr-4 font-medium">Uploaded by</th>
              <th className="py-2 pr-4 font-medium">When</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 align-top">
                <td className="py-2 pr-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.publicPath}
                    alt=""
                    className="h-16 w-24 rounded border border-zinc-200 object-cover"
                  />
                </td>
                <td className="py-2 pr-4 text-zinc-700">
                  {p.caption ?? "—"}
                </td>
                <td className="py-2 pr-4 text-zinc-700">
                  {p.user.name ?? p.user.email ?? "—"}
                  <br />
                  <span className="font-mono text-xs text-zinc-500">
                    {p.user.slackId ?? ""}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-zinc-500">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => void remove(p.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
