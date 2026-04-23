import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const seeker = await prisma.seekerProfile.findUnique({ where: { userId: session.user.id } });
  if (!seeker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.match.updateMany({
    where: { id, seekerId: seeker.id },
    data: { dismissed: true },
  });

  return NextResponse.json({ ok: true });
}
