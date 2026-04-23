"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
          Job<span className="text-blue-600">Match</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-2">
          {status === "loading" && (
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
          )}

          {status === "authenticated" && role === "SEEKER" && (
            <>
              <Link href="/seeker/profile">
                <Button variant="ghost" size="sm">Profile</Button>
              </Link>
              <Link href="/seeker/matches">
                <Button variant="ghost" size="sm">My Matches</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          )}

          {status === "authenticated" && role === "COMPANY" && (
            <>
              <Link href="/company/profile">
                <Button variant="ghost" size="sm">Company</Button>
              </Link>
              <Link href="/company/jobs">
                <Button variant="ghost" size="sm">Jobs</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
