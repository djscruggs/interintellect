"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Django", "FastAPI", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "GraphQL", "REST APIs",
  "Git", "CI/CD", "Tailwind CSS", "Vue.js", "Angular", "Java", "Go",
  "Rust", "Ruby", "Rails", "PHP", "Laravel", "Swift", "Kotlin",
  "React Native", "Flutter", "Figma", "Product Management", "Data Analysis",
  "Machine Learning", "SQL", "Excel", "Salesforce", "HubSpot",
];

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsInput({ value, onChange }: SkillsInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = input.length > 0
    ? SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(s)
      ).slice(0, 6)
    : [];

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[44px] cursor-text bg-white focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((skill) => (
          <Badge key={skill} variant="secondary" className="flex items-center gap-1 pr-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => input.length > 0 && setShowSuggestions(true)}
          placeholder={value.length === 0 ? "Type a skill and press Enter…" : ""}
          className="flex-1 min-w-[140px] outline-none text-sm bg-transparent"
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => addSkill(s)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-400 mt-1">
        Pick from suggestions or type your own and press Enter
      </p>
    </div>
  );
}
