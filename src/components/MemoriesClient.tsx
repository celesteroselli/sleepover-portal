"use client";

import { useCallback, useEffect, useState } from "react";

type PhotoUser = {
  name: string | null;
  slackId: string | null;
  email: string | null;
};

type Photo = {
  id: string;
  publicPath: string;
  caption: string | null;
  createdAt: string;
  user: PhotoUser;
};

export function MemoriesClient() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/memories");
    if (!res.ok) {
      setError("Could not load photos.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { photos: Photo[] };
    setPhotos(data.photos);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = await fetch("/api/memories", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(
        typeof body.error === "string" ? body.error : "Upload failed."
      );
      return;
    }
    form.reset();
    void load();
  }

  return (
    <div className="space-y-8">
      <section className="rounded border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="mb-3 text-lg font-medium text-zinc-900">Add a photo</h2>
        <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
          <label className="text-sm text-zinc-700">
            Photo (JPEG, PNG, GIF, WebP)
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/gif,image/webp"
              required
              className="mt-1 block w-full text-sm"
            />
          </label>
          <label className="text-sm text-zinc-700">
            Caption (optional)
            <input
              type="text"
              name="caption"
              className="mt-1 block w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="w-fit rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading…</p>}

      {!loading && photos.length === 0 && (
        <p className="text-sm text-zinc-500">No photos yet. Add one above.</p>
      )}

      <ul className="grid gap-6 sm:grid-cols-2">
        {photos.map((p) => (
          <li key={p.id} className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.publicPath}
              alt={p.caption ?? "Memory"}
              className="max-h-64 w-full rounded border border-zinc-200 object-contain bg-zinc-100"
            />
            {p.caption && (
              <p className="text-sm text-zinc-800">{p.caption}</p>
            )}
            <p className="text-xs text-zinc-500">
              By {p.user.name ?? p.user.email ?? "Unknown"}
              {p.user.slackId ? ` · ${p.user.slackId}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
