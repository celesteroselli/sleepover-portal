import { buildAuthorizeUrl } from "@/lib/hackclub";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(buildAuthorizeUrl());
}
