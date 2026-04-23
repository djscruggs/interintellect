"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillsInput } from "@/components/SkillsInput";

export default function SeekerProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [desiredRole, setDesiredRole] = useState("");
  const [experienceYrs, setExperienceYrs] = useState(0);
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(true);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load existing profile
  useEffect(() => {
    fetch("/api/seeker/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setName(data.name ?? "");
        setBio(data.bio ?? "");
        setSkills(data.skills ?? []);
        setDesiredRole(data.desiredRole ?? "");
        setExperienceYrs(data.experienceYrs ?? 0);
        setLocation(data.location ?? "");
        setRemote(data.remote ?? true);
        setResumeText(data.resumeText ?? "");
        if (data.resumeText) setResumeFileName("resume-on-file.pdf");
      });
  }, []);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/seeker/resume", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to parse resume.");
    } else {
      setResumeText(data.text);
      setResumeFileName(file.name);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/seeker/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, skills, desiredRole, experienceYrs, location, remote, resumeText }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/seeker/matches"), 1000);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-500 mb-8">Tell us about yourself so we can find the right jobs for you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">Profile saved! Redirecting to your matches…</p>}

          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short bio <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few sentences about you and your background…" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What you&apos;re looking for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desiredRole">Desired role title</Label>
                <Input id="desiredRole" value={desiredRole} onChange={(e) => setDesiredRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYrs">Years of experience</Label>
                <Input id="experienceYrs" type="number" min={0} max={50} value={experienceYrs} onChange={(e) => setExperienceYrs(Number(e.target.value))} />
              </div>
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
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Austin, TX" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add the skills you have — the more accurate, the better your matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillsInput value={skills} onChange={setSkills} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload a PDF — we&apos;ll extract the text to improve your matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Parsing…" : "Upload PDF"}
                </Button>
                {resumeFileName && (
                  <span className="text-sm text-gray-600">✓ {resumeFileName}</span>
                )}
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save profile & find matches"}
          </Button>
        </form>
      </div>
    </div>
  );
}
