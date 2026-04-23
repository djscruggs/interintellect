import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.seekerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, skills, desiredRole, experienceYrs, location, remote, resumeText } = body;

  if (!name || !desiredRole || !skills?.length) {
    return NextResponse.json({ error: "Name, desired role, and at least one skill are required." }, { status: 400 });
  }

  const profile = await prisma.seekerProfile.upsert({
    where: { userId: session.user.id },
    update: { name, bio, skills, desiredRole, experienceYrs: Number(experienceYrs), location, remote, resumeText },
    create: { userId: session.user.id, name, bio, skills, desiredRole, experienceYrs: Number(experienceYrs), location, remote, resumeText },
  });

  return NextResponse.json(profile);
}
