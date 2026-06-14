import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getSearchIndex();
  return NextResponse.json(items);
}
