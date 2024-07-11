import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import auth from "@/app/configs/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(auth.storageTokenKeyName)?.value;
  const isPublicPath =
    path === "/login" || path === "/register" || path === "/" ;

  if (!isPublicPath && token === undefined) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (path === "/" && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/chatweb", request.url));
  }
}

export const config = {
  matcher: ["/", "/login", "/register", "/chatweb"],
};
