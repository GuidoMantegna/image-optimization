import { NextRequest, NextResponse } from "next/server";
import { UNSPLASH_BASE, DEFAULT_QUERY, REVALIDATE_SECONDS } from "@/lib/constants";
import {
  requireAccessKey,
  clampPerPage,
  pickRateLimitHeaders,
  proxyError,
} from "@/lib/unsplash-route-utils";

const VALID_ORDER_BY = new Set(["relevant", "latest"]);

export async function GET(request: NextRequest) {
  const accessKey = requireAccessKey();
  if (accessKey instanceof NextResponse) return accessKey;

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query") || DEFAULT_QUERY;
  const page = searchParams.get("page") ?? "1";
  const perPage = clampPerPage(searchParams.get("per_page"));
  const color = searchParams.get("color");
  const orientation = searchParams.get("orientation");
  const orderBy = searchParams.get("order_by") ?? "relevant";
  const collections = searchParams.get("collections");

  const safeOrderBy = VALID_ORDER_BY.has(orderBy) ? orderBy : "relevant";

  const apiUrl = new URL(`${UNSPLASH_BASE}/search/photos`);
  apiUrl.searchParams.set("query", query);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(perPage));
  apiUrl.searchParams.set("order_by", safeOrderBy);
  if (color) apiUrl.searchParams.set("color", color);
  if (orientation) apiUrl.searchParams.set("orientation", orientation);
  if (collections) apiUrl.searchParams.set("collections", collections);

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) return proxyError(res, "Unsplash Search Photos");

  const data = await res.json();
  return NextResponse.json(data.results ?? [], { headers: pickRateLimitHeaders(res) });
}
