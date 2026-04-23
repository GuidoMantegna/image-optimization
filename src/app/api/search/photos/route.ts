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
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("per_page") ?? "20";
  const color = searchParams.get("color");
  const orientation = searchParams.get("orientation");
  const orderBy = searchParams.get("order_by") ?? "relevant";

  const clampedPerPage = Math.min(Math.max(Number(perPage), 1), 30);
  const safeOrderBy = (["relevant", "latest"] as string[]).includes(orderBy)
    ? orderBy
    : "relevant";

  // Unsplash search requires a query — use broad fallback when no user-supplied term
  const query = searchParams.get("query") || "photography";

  const apiUrl = new URL(`${UNSPLASH_BASE}/search/photos`);
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(clampedPerPage));
  apiUrl.searchParams.set("order_by", safeOrderBy);
  if (color) apiUrl.searchParams.set("color", color);
  if (orientation) apiUrl.searchParams.set("orientation", orientation);

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Unsplash Search API Error]", res.status, body);
    return NextResponse.json(
      { error: `Unsplash API error: ${res.status}` },
      { status: res.status }
    );
  }

  // Search endpoint returns { results: [], total: N, total_pages: N }
  const data = await res.json();

  const headers = new Headers();
  const rl = res.headers.get("X-Ratelimit-Remaining");
  const rlLimit = res.headers.get("X-Ratelimit-Limit");
  if (rl) headers.set("X-Ratelimit-Remaining", rl);
  if (rlLimit) headers.set("X-Ratelimit-Limit", rlLimit);

  return NextResponse.json(data.results ?? [], { headers });
}
