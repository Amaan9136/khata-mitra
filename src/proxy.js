import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export async function proxy(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/dashboard/:path*", "/applications/:path*"] };
