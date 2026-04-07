import { NextRequest, NextResponse } from "next/server";
import { kvSet, kvGet, kvDel, kvKeys } from "@/lib/store";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const keysPattern = req.nextUrl.searchParams.get("keys");

  if (keysPattern) {
    const keys = await kvKeys(keysPattern);
    return NextResponse.json({ keys });
  }
  if (key) {
    const value = await kvGet(key);
    return NextResponse.json({ value });
  }
  return NextResponse.json({ error: "Missing key param" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  await kvSet(key, value);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  await kvDel(key);
  return NextResponse.json({ ok: true });
}
