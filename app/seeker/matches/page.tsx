"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCardSkeleton } from "@/components/MatchCardSkeleton";

type Match = {
  id: string;
  score: number;
  reasoning: string;
  job: {
    id: string;
    title: string;
    requiredSkills: string[];
    experienceLevel: string;
    remote: boolean;
    location: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    company: { name: string; website: string | null };
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

export default function SeekerMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/match/seeker")
      .then((r) => r.json())
      .then((data) => { setMatches(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function runMatching() {
    setRunning(true);
    const res = await fetch("/api/match/seeker", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Matching failed. Check the console for details.");
    } else {
      setMatches(Array.isArray(data) ? data : []);
    }
    setRunning(false);
  }

  async function dismiss(matchId: string) {
    await fetch(`/api/match/seeker/${matchId}/dismiss`, { method: "POST" });
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
            <p className="text-gray-500 mt-1">Jobs picked for you by AI</p>
          </div>
          <div className="flex gap-3">
            <Link href="/seeker/profile">
              <Button variant="outline">Edit profile</Button>
            </Link>
            <Button onClick={runMatching} disabled={running}>
              {running ? "Finding matches…" : "Find matches"}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <MatchCardSkeleton key={i} />)}
          </div>
        )}

        {running && (
          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <span className="animate-spin text-lg">⟳</span>
            AI is scanning jobs for you — this takes 5–10 seconds…
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No matches yet.</p>
            <p className="text-sm mb-6">Click &quot;Find matches&quot; to let AI scan open jobs for you.</p>
            <Button onClick={runMatching} disabled={running}>
              {running ? "Finding matches…" : "Find my matches"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{match.job.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {match.job.company.name}
                      {match.job.company.website && (
                        <> · <a href={match.job.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">website</a></>
                      )}
                    </p>
                  </div>
                  <ScoreBadge score={match.score} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {match.job.requiredSkills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{match.job.experienceLevel}</span>
                  <span>{match.job.remote ? "Remote" : match.job.location ?? "On-site"}</span>
                  {match.job.salaryMin && match.job.salaryMax && (
                    <span>${match.job.salaryMin.toLocaleString()} – ${match.job.salaryMax.toLocaleString()}</span>
                  )}
                </div>

                <button
                  onClick={() => setExpanded(expanded === match.id ? null : match.id)}
                  className="text-sm text-blue-600 hover:underline mb-2"
                >
                  {expanded === match.id ? "Hide reasoning" : "Why this match?"}
                </button>

                {expanded === match.id && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">{match.reasoning}</p>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => dismiss(match.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Not interested
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
