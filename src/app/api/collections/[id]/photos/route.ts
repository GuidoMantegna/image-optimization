import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_BASE = "https://api.unsplash.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("per_page") ?? "20";

  const clampedPerPage = Math.min(Math.max(Number(perPage), 1), 30);

  const apiUrl = new URL(`${UNSPLASH_BASE}/collections/${id}/photos`);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(clampedPerPage));

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Unsplash Collection Photos Error]", res.status, body);
    return NextResponse.json(
      { error: `Unsplash API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  const headers = new Headers();
  const rl = res.headers.get("X-Ratelimit-Remaining");
  if (rl) headers.set("X-Ratelimit-Remaining", rl);

  return NextResponse.json(data, { headers });
}
