import { getSession, isAdminSlackId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminSlackId(session.slackId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const photo = await prisma.memoryPhoto.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rel = photo.publicPath.replace(/^\//, "");
  const resolved = path.resolve(process.cwd(), "public", rel);
  const uploadsRoot = path.resolve(
    process.cwd(),
    "public",
    "uploads",
    "memories"
  );
  if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
    return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
  }
  try {
    await unlink(resolved);
  } catch {
    /* file may already be gone */
  }

  await prisma.memoryPhoto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
