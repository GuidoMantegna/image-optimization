import { NextRequest, NextResponse } from "next/server";
import { UNSPLASH_BASE } from "@/lib/constants";
import {
  requireAccessKey,
  clampPerPage,
  pickRateLimitHeaders,
  proxyError,
} from "@/lib/unsplash-route-utils";

export async function GET(request: NextRequest) {
  const accessKey = requireAccessKey();
  if (accessKey instanceof NextResponse) return accessKey;

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q") ?? "";
  const page = searchParams.get("page") ?? "1";
  const perPage = clampPerPage(searchParams.get("per_page"), 10);

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, total_pages: 0 });
  }

  const apiUrl = new URL(`${UNSPLASH_BASE}/search/collections`);
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(perPage));

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) return proxyError(res, "Unsplash Collections Search");

  const data = await res.json();
  return NextResponse.json(data, { headers: pickRateLimitHeaders(res) });
}
