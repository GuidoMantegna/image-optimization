import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_BASE = "https://api.unsplash.com";

export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("per_page") ?? "10";

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, total_pages: 0 });
  }

  const clampedPerPage = Math.min(Math.max(Number(perPage), 1), 30);

  const apiUrl = new URL(`${UNSPLASH_BASE}/search/collections`);
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(clampedPerPage));

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Unsplash Collections Search Error]", res.status, body);
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
