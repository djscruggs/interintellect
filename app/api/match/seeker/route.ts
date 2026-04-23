import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchSeekerToJobs } from "@/lib/claude";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seeker = await prisma.seekerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seeker) {
    return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });
  }

  const jobs = await prisma.job.findMany({
    where: { active: true },
    take: 100,
    orderBy: { createdAt: "desc" },
  });

  if (jobs.length === 0) {
    return NextResponse.json([]);
  }

  let results;
  try {
    results = await matchSeekerToJobs(seeker, jobs);
  } catch (err) {
    console.error("Claude matching error:", err);
    return NextResponse.json({ error: "AI matching failed. Please try again." }, { status: 500 });
  }

  console.log("Claude returned results:", JSON.stringify(results));

  if (!Array.isArray(results) || results.length === 0) {
    return NextResponse.json([]);
  }

  await Promise.all(
    results.map((r) =>
      prisma.match.upsert({
        where: { seekerId_jobId: { seekerId: seeker.id, jobId: r.jobId! } },
        update: { score: r.score, reasoning: r.reasoning, dismissed: false },
        create: { seekerId: seeker.id, jobId: r.jobId!, score: r.score, reasoning: r.reasoning },
      })
    )
  );

  const matches = await prisma.match.findMany({
    where: { seekerId: seeker.id, dismissed: false },
    include: { job: { include: { company: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(matches);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seeker = await prisma.seekerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seeker) return NextResponse.json([]);

  const matches = await prisma.match.findMany({
    where: { seekerId: seeker.id, dismissed: false },
    include: { job: { include: { company: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(matches);
}
