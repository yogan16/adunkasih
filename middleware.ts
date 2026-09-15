import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const CITIZEN_ROUTES = ["/dashboard", "/permohonan", "/status", "/profile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/pegawai") && role !== "PEGAWAI") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (pathname.startsWith("/wakil-adun") && role !== "WAKIL_ADUN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (CITIZEN_ROUTES.some((route) => pathname.startsWith(route)) && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/pegawai/:path*",
    "/wakil-adun/:path*",
    "/permohonan/:path*",
    "/status/:path*",
    "/profile/:path*",
  ],
};
