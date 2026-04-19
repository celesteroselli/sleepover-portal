"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const MOBILE_MAX = 767;

function hackClubSlackProfileUrl(slackUserId: string) {
  return `https://hackclub.slack.com/team/${encodeURIComponent(slackUserId)}`;
}

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
  const [photosPerRow, setPhotosPerRow] = useState(3);

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

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const sync = () => setPhotosPerRow(mq.matches ? 2 : 3);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const rows = useMemo(() => {
    const out: Photo[][] = [];
    for (let i = 0; i < photos.length; i += photosPerRow) {
      out.push(photos.slice(i, i + photosPerRow));
    }
    return out;
  }, [photos, photosPerRow]);

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
    <div className="w-full space-y-8">
      <section className="mx-auto max-w-xl rounded-xl border border-[#f2ffb2]/40 bg-[#132943]/85 p-5 text-[#f2ffb2]">
        <h2 className="mb-3 text-center text-xl font-semibold">Add a photo</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-sm">
            Photo (JPEG, PNG, GIF, WebP)
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/gif,image/webp"
              required
              className="mt-1 block w-full text-sm"
            />
          </label>
          <label className="text-sm">
            Caption (optional)
            <input
              type="text"
              name="caption"
              className="mt-1 block w-full rounded border border-[#f2ffb2]/50 bg-white/95 px-2 py-1 text-sm text-zinc-900"
            />
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="mx-auto w-fit rounded bg-[#f2ffb2] px-4 py-1.5 text-sm font-semibold text-[#173048] disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Hang on the line"}
          </button>
        </form>
      </section>

      {error && <p className="text-center text-sm text-red-300">{error}</p>}
      {loading && <p className="text-center text-sm text-blue-100">Loading...</p>}

      {!loading && photos.length === 0 && (
        <p className="text-center text-sm text-blue-100">
          No memories yet. Add one above to start the string.
        </p>
      )}

      {!loading && photos.length > 0 && (
        <div className="memory-string-wall">
          {rows.map((row, rowIndex) => {
            const leftToRight = rowIndex % 2 === 0;
            return (
              <section
                key={`memory-row-${rowIndex}`}
                className={`memory-row-block memory-row ${leftToRight ? "memory-row-right" : "memory-row-left"}`}
              >
                <svg
                  className="memory-row-string"
                  viewBox="0 0 1200 220"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {leftToRight ? (
                    <path d="M16 28 Q 380 186 812 124 Q 1034 92 1184 40" />
                  ) : (
                    <path d="M16 40 Q 212 92 392 124 Q 824 186 1184 28" />
                  )}
                </svg>

                <div className="memory-row-photos">
                    {row.map((p, photoIndex) => {
                      const rotation =
                        [-5, 2, -3, 4, -2, 3][
                          (rowIndex * photosPerRow + photoIndex) % 6
                        ];
                      return (
                        <article
                          key={p.id}
                          className="memory-polaroid-card"
                          style={{ transform: `rotate(${rotation}deg)` }}
                        >
                          <span className="memory-clothespin" />
                          <div className="memory-polaroid-stage">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.publicPath}
                              alt={p.caption ?? "Memory"}
                              className="memory-photo-image"
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/polaroid-frame.svg"
                              alt=""
                              aria-hidden="true"
                              className="memory-polaroid-overlay"
                            />
                          </div>
                          <p className="memory-meta">
                            {p.caption ?? "Untitled memory"}
                            <span>
                              {p.user.name ?? p.user.email ?? "Unknown"}
                              {p.user.slackId ? (
                                <a
                                  href={hackClubSlackProfileUrl(p.user.slackId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="memory-slack-profile-btn ms-3"
                                >
                                  Slack profile
                                </a>
                              ) : null}
                            </span>
                          </p>
                        </article>
                      );
                    })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
