import { getSession, isAdminSlackId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** Hard cap per upload to limit disk exhaustion (MIME is still client-reported). */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

/** Fields exposed to any logged-in user (no name, email, Slack, or userId). */
const memoryPhotoPublicSelect = {
  id: true,
  publicPath: true,
  caption: true,
  createdAt: true,
} as const;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photos = await prisma.memoryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    select: memoryPhotoPublicSelect,
  });

  return NextResponse.json({ photos });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("photo");
  const caption = form.get("caption");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing photo" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 12 MB)." },
      { status: 413 }
    );
  }
  const name = `${randomUUID()}.${extForMime(file.type)}`;
  const publicPath = `/uploads/memories/${name}`;
  const dir = path.join(process.cwd(), "public", "uploads", "memories");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);

  const photo = await prisma.memoryPhoto.create({
    data: {
      publicPath,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      userId: session.userId,
    },
    include: {
      user: { select: { id: true, name: true, slackId: true, email: true } },
    },
  });

  if (isAdminSlackId(session.slackId)) {
    return NextResponse.json({ photo });
  }

  return NextResponse.json({
    photo: {
      id: photo.id,
      publicPath: photo.publicPath,
      caption: photo.caption,
      createdAt: photo.createdAt,
    },
  });
}
