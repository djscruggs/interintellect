import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExperienceLevel } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: { jobs: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(company?.jobs ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return NextResponse.json({ error: "Complete your company profile first." }, { status: 400 });
  }

  const { title, description, requiredSkills, experienceLevel, remote, location, salaryMin, salaryMax } = await req.json();

  if (!title || !description || !requiredSkills?.length || !experienceLevel) {
    return NextResponse.json({ error: "Title, description, skills, and experience level are required." }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      description,
      requiredSkills,
      experienceLevel: experienceLevel as ExperienceLevel,
      remote,
      location,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
    },
  });

  return NextResponse.json(job);
}
