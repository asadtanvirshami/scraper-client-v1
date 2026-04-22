import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Only allow proxying from known CDN/social hosts
  const allowedHostSuffixes = [
    "fbcdn.net",
    "instagram.com",
    "cdninstagram.com",
    "googleusercontent.com",
    "licdn.com",
  ];
  const isAllowed = allowedHostSuffixes.some((suffix) =>
    parsed.hostname.endsWith(suffix),
  );
  if (!isAllowed) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        // Mimic a browser request so CDNs don't reject it
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return new NextResponse("Failed to fetch image", {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse("Proxy error", { status: 502 });
  }
}
