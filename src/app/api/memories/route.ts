import { getSession } from "@/lib/auth";
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

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photos = await prisma.memoryPhoto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, slackId: true, email: true } },
    },
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

  return NextResponse.json({ photo });
}
