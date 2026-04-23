import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, website } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  }

  const profile = await prisma.companyProfile.upsert({
    where: { userId: session.user.id },
    update: { name, description, website },
    create: { userId: session.user.id, name, description, website },
  });

  return NextResponse.json(profile);
}
