import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function sameSecret(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    if (process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1", "[::1]"].includes(request.nextUrl.hostname)) return NextResponse.next();
    return NextResponse.json({ error: "Admin access is disabled until ADMIN_USERNAME and ADMIN_PASSWORD are configured." }, { status: 503 });
  }
  const authorization = request.headers.get("authorization") || "";
  let credentials = "";
  if (authorization.startsWith("Basic ")) credentials = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  const separator = credentials.indexOf(":");
  if (separator < 0 || !sameSecret(credentials.slice(0, separator), username) || !sameSecret(credentials.slice(separator + 1), password)) {
    return new NextResponse("Admin sign-in required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Ammaai Admin", charset="UTF-8"', "Cache-Control": "no-store" } });
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== request.nextUrl.origin && origin !== process.env.NEXT_PUBLIC_SITE_URL)) return NextResponse.json({ error: "Cross-origin changes are not allowed." }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/:path*"] };
