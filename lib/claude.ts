import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type MatchResult = {
  jobId?: string;
  seekerId?: string;
  score: number;
  reasoning: string;
};

export async function matchSeekerToJobs(
  seeker: {
    name: string;
    desiredRole: string;
    skills: string[];
    experienceYrs: number;
    bio: string | null;
    resumeText: string | null;
    remote: boolean;
  },
  jobs: {
    id: string;
    title: string;
    requiredSkills: string[];
    experienceLevel: string;
    description: string;
    remote: boolean;
  }[]
): Promise<MatchResult[]> {
  const jobsPayload = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    requiredSkills: j.requiredSkills,
    experienceLevel: j.experienceLevel,
    description: j.description.slice(0, 300),
    remote: j.remote,
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `You are a job matching expert. Score each job for this candidate and return only the top matches.

CANDIDATE:
- Name: ${seeker.name}
- Desired role: ${seeker.desiredRole}
- Skills: ${seeker.skills.join(", ")}
- Experience: ${seeker.experienceYrs} years
- Remote preference: ${seeker.remote ? "Remote" : "On-site"}
- Bio: ${seeker.bio ?? "Not provided"}
- Resume excerpt: ${seeker.resumeText?.slice(0, 500) ?? "Not provided"}

JOBS:
${JSON.stringify(jobsPayload, null, 2)}

Return a JSON array of matches scoring above 40, sorted by score descending, top 10 only.
Each item must have: jobId (string), score (integer 0-100), reasoning (1-2 sentences max).
Return ONLY valid JSON, no explanation, no markdown.`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  console.log("Claude seeker->jobs raw response:", text);
  return JSON.parse(text) as MatchResult[];
}

export async function matchJobToSeekers(
  job: {
    id: string;
    title: string;
    requiredSkills: string[];
    experienceLevel: string;
    description: string;
    remote: boolean;
  },
  seekers: {
    id: string;
    name: string;
    desiredRole: string;
    skills: string[];
    experienceYrs: number;
    remote: boolean;
  }[]
): Promise<MatchResult[]> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `You are a recruiting expert. Score each candidate for this job and return only the top matches.

JOB:
- Title: ${job.title}
- Required skills: ${job.requiredSkills.join(", ")}
- Experience level: ${job.experienceLevel}
- Description: ${job.description.slice(0, 300)}
- Remote: ${job.remote ? "Yes" : "No"}

CANDIDATES:
${JSON.stringify(seekers, null, 2)}

Return a JSON array of matches scoring above 40, sorted by score descending, top 10 only.
Each item must have: seekerId (string), score (integer 0-100), reasoning (1-2 sentences max).
Return ONLY valid JSON, no explanation, no markdown.`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "[]";
  const text = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  console.log("Claude job->seekers raw response:", text);
  return JSON.parse(text) as MatchResult[];
}
