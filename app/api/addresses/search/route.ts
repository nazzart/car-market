import { NextRequest, NextResponse } from "next/server";

import { searchAddresses } from "@/features/addresses/addressIndex";

// Подсказки адресов: /api/addresses/search?q=brivibas 100&lat=56.95&lng=24.1
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").slice(0, 100);
  const near = { lat: Number(params.get("lat")) || 56.95, lng: Number(params.get("lng")) || 24.1 };

  if (q.trim().length < 3) return NextResponse.json([]);

  try {
    return NextResponse.json(await searchAddresses(q, near));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Addresses unavailable" }, { status: 503 });
  }
}
