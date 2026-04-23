import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/seeker") && token?.role !== "SEEKER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/company") && token?.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/seeker/:path*", "/company/:path*"],
};
