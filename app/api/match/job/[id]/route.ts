import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchJobToSeekers } from "@/lib/claude";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const job = await prisma.job.findFirst({ where: { id: jobId, companyId: company.id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const seekers = await prisma.seekerProfile.findMany({
    take: 100,
    orderBy: { updatedAt: "desc" },
  });

  if (seekers.length === 0) return NextResponse.json([]);

  const results = await matchJobToSeekers(job, seekers);

  await Promise.all(
    results.map((r) =>
      prisma.match.upsert({
        where: { seekerId_jobId: { seekerId: r.seekerId!, jobId: job.id } },
        update: { score: r.score, reasoning: r.reasoning },
        create: { seekerId: r.seekerId!, jobId: job.id, score: r.score, reasoning: r.reasoning },
      })
    )
  );

  const matches = await prisma.match.findMany({
    where: { jobId: job.id, dismissed: false },
    include: { seeker: true },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(matches);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;

  const matches = await prisma.match.findMany({
    where: { jobId, dismissed: false },
    include: { seeker: true },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(matches);
}
