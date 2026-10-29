import { NextRequest, NextResponse } from "next/server";

import { nearestAddress } from "@/features/addresses/addressIndex";

// Адрес по точке на карте: /api/addresses/reverse?lat=56.928&lng=24.034
export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json(null, { status: 400 });

  try {
    return NextResponse.json(await nearestAddress(lat, lng));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Addresses unavailable" }, { status: 503 });
  }
}
