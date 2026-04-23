"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillsInput } from "@/components/SkillsInput";

const EXPERIENCE_LEVELS = [
  { value: "JUNIOR", label: "Junior (0–2 years)" },
  { value: "MID", label: "Mid-level (2–5 years)" },
  { value: "SENIOR", label: "Senior (5–10 years)" },
  { value: "LEAD", label: "Lead / Principal (10+ years)" },
];

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [remote, setRemote] = useState(true);
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!experienceLevel) { setError("Please select an experience level."); return; }
    setSaving(true);
    setError("");

    const res = await fetch("/api/company/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, requiredSkills, experienceLevel, remote, location, salaryMin, salaryMax }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to post job.");
      setSaving(false);
    } else {
      router.push("/company/jobs");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
        <p className="text-gray-500 mb-8">The more detail you add, the better your candidate matches.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

          <Card>
            <CardHeader><CardTitle>Job details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this person do? What does success look like?"
                  rows={5}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Required skills</Label>
                <SkillsInput value={requiredSkills} onChange={setRequiredSkills} />
              </div>

              <div className="space-y-2">
                <Label>Experience level</Label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.value)}
                      className={`border-2 rounded-lg p-3 text-left text-sm transition-colors ${
                        experienceLevel === lvl.value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Location & salary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Work preference</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRemote(true)}
                    className={`flex-1 border-2 rounded-lg p-3 text-sm font-medium transition-colors ${remote ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    Remote
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemote(false)}
                    className={`flex-1 border-2 rounded-lg p-3 text-sm font-medium transition-colors ${!remote ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    On-site
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary min <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input id="salaryMin" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="80000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salary max <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input id="salaryMax" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="120000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Posting…" : "Post job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
