"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCardSkeleton } from "@/components/MatchCardSkeleton";

type Match = {
  id: string;
  score: number;
  reasoning: string;
  seeker: {
    id: string;
    name: string;
    desiredRole: string;
    skills: string[];
    experienceYrs: number;
    remote: boolean;
    location: string | null;
    bio: string | null;
  };
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-800" :
    score >= 60 ? "bg-yellow-100 text-yellow-800" :
    "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
      {score}% match
    </span>
  );
}

export default function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/match/job/${jobId}`)
      .then((r) => r.json())
      .then((data) => { setMatches(Array.isArray(data) ? data : []); setLoading(false); });
  }, [jobId]);

  async function runMatching() {
    setRunning(true);
    const res = await fetch(`/api/match/job/${jobId}`, { method: "POST" });
    const data = await res.json();
    setMatches(Array.isArray(data) ? data : []);
    setRunning(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/company/jobs" className="text-sm text-blue-600 hover:underline mb-2 block">
              ← Back to jobs
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Matches</h1>
            <p className="text-gray-500 mt-1">AI-matched candidates for this role</p>
          </div>
          <Button onClick={runMatching} disabled={running}>
            {running ? "Finding candidates…" : "Find candidates"}
          </Button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        )}

        {running && (
          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <span className="animate-spin text-lg">⟳</span>
            AI is scanning candidates — this takes 5–10 seconds…
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No candidates yet.</p>
            <p className="text-sm mb-6">Click &quot;Find candidates&quot; to let AI scan registered job seekers.</p>
            <Button onClick={runMatching} disabled={running}>
              {running ? "Searching…" : "Find candidates now"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{match.seeker.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {match.seeker.desiredRole} · {match.seeker.experienceYrs} yr{match.seeker.experienceYrs !== 1 ? "s" : ""}
                      {match.seeker.remote ? " · Remote" : match.seeker.location ? ` · ${match.seeker.location}` : ""}
                    </p>
                  </div>
                  <ScoreBadge score={match.score} />
                </div>
              </CardHeader>
              <CardContent>
                {match.seeker.bio && (
                  <p className="text-sm text-gray-600 mb-3">{match.seeker.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {match.seeker.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>

                <button
                  onClick={() => setExpanded(expanded === match.id ? null : match.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {expanded === match.id ? "Hide reasoning" : "Why this candidate?"}
                </button>

                {expanded === match.id && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md mt-2">{match.reasoning}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
