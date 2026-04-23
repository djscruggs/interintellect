"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = {
  id: string;
  title: string;
  requiredSkills: string[];
  experienceLevel: string;
  remote: boolean;
  active: boolean;
  createdAt: string;
};

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/company/jobs")
      .then((r) => r.json())
      .then((data) => { setJobs(data); setLoading(false); });
  }, []);

  async function toggleActive(job: Job) {
    const res = await fetch(`/api/company/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !job.active }),
    });
    if (res.ok) {
      setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, active: !j.active } : j));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Job Postings</h1>
            <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
          </div>
          <Link href="/company/jobs/new">
            <Button>+ Post a job</Button>
          </Link>
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-4">No jobs posted yet.</p>
            <Link href="/company/jobs/new">
              <Button variant="outline">Post your first job</Button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className={job.active ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={job.active ? "default" : "secondary"}>
                      {job.active ? "Active" : "Paused"}
                    </Badge>
                    <Link href={`/company/jobs/${job.id}/candidates`}>
                      <Button size="sm" variant="outline">Find candidates</Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.requiredSkills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{job.experienceLevel}</span>
                  <span>{job.remote ? "Remote" : "On-site"}</span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => toggleActive(job)}
                    className="ml-auto text-blue-600 hover:underline text-sm"
                  >
                    {job.active ? "Pause listing" : "Reactivate"}
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
