"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/company/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data) return;
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setWebsite(data.website ?? "");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/company/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, website }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/company/jobs"), 1000);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
        <p className="text-gray-500 mb-8">Tell job seekers about your company.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-md">Profile saved! Redirecting…</p>}

          <Card>
            <CardHeader><CardTitle>About your company</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your company do? What's the culture like?"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save & go to jobs"}
          </Button>
        </form>
      </div>
    </div>
  );
}
