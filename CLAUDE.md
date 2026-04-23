# JobMatch — CLAUDE.md

AI-powered job matching marketplace. Job seekers post profiles, companies post jobs, Claude AI scores and explains matches.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma 5** + **PostgreSQL** (Supabase)
- **NextAuth v4** — email/password auth, JWT sessions
- **Anthropic Claude** — AI matching via `lib/claude.ts`
- **Tailwind CSS** + **shadcn/ui** components
- **Vercel** — production deployment

## Local Development

```bash
nvm use 20          # Node 20 required
npm install
npm run dev         # http://localhost:3000
```

## Environment Variables

Required in `.env` (never commit this file):

```
DATABASE_URL=       # Supabase PostgreSQL connection string
NEXTAUTH_SECRET=    # Random secret: openssl rand -base64 32
NEXTAUTH_URL=       # http://localhost:3000 (or production URL)
ANTHROPIC_API_KEY=  # From console.anthropic.com
```

## Database

```bash
npx prisma migrate dev    # Apply migrations locally
npx prisma studio         # Browse data in browser
```

Schema is in `prisma/schema.prisma`. Models: `User`, `SeekerProfile`, `CompanyProfile`, `Job`, `Match`.

## Key Files

| File | Purpose |
|---|---|
| `lib/claude.ts` | AI matching logic — `matchSeekerToJobs` and `matchJobToSeekers` |
| `lib/auth.ts` | NextAuth config with bcrypt credentials provider |
| `lib/prisma.ts` | Shared Prisma client (singleton pattern) |
| `proxy.ts` | Route protection middleware — guards `/seeker/*` and `/company/*` |
| `components/SkillsInput.tsx` | Tag input with autocomplete and delete |

## Deploy

Push to `main` → Vercel auto-deploys.

Manual deploy: `npx vercel --prod --scope djscruggs-projects`

Production URL: https://interintellect.vercel.app

## User Flows

**Seeker:** Register → `/seeker/profile` → `/seeker/matches` → click "Find matches"

**Company:** Register → `/company/profile` → `/company/jobs` → post job → `/company/jobs/[id]/candidates` → click "Find candidates"

## Known Issues

- PDF resume parsing uses `pdf2json` — some PDFs with unusual encoding may fail silently
- AI matching requires at least one active job and one seeker profile to return results
- Score threshold is 40/100 — matches below this are not stored
